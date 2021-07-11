<script>
import appConfig from '@src/app.config'
import Layout from '@layouts/main.vue'
import {
  courseComputed,
  courseMethods,
  workbookComputed,
  workbookMethods,
} from '@state/helpers'
// Thanks to: https://vue-xlsx.netlify.app/
import { XlsxWorkbook, XlsxSheet, XlsxDownload } from 'vue-xlsx'
const XLSX = require('xlsx')

export default {
  page: {
    title: 'XLSX',
    meta: [{ name: 'description', content: appConfig.description }],
  },
  components: {
    Layout,
    XlsxWorkbook,
    XlsxSheet,
    XlsxDownload,
  },
  data() {
    return {
      waitingForFile: true,
      sheets: [{ name: 'NoLo', data: [{}] }],
      ready: false,
      previewButtonText: 'View',
      showPreview: false,
      previewHTML: '',
    }
  },
  mounted() {
    if (this.workbook() !== null) {
      this.waitingForFile = false
      this.ready = true
    }
  },
  beforeUpdate() {
    this.renderPreview()
    this.processSheet()
  },
  methods: {
    ...courseComputed,
    ...courseMethods,
    ...workbookComputed,
    ...workbookMethods,
    onChange(event) {
      const self = this
      const files = event.target.files
      const f = files[0]
      const reader = new FileReader()
      reader.onload = function(e) {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        self.setWorkbook(workbook)
        self.waitingForFile = false
      }
      reader.readAsArrayBuffer(f)
    },
    processSheet() {
      if (this.workbook() !== null) {
        const sheets = this.workbook().Sheets
        const firstSheet = sheets[Object.keys(sheets)[0]]

        const NOT_RENTAL = 'N'
        const COLUMNS = {
          subjectCode: 'E',
          courseNumber: 'F',
          sectionId: 'G',
          note: 'H',
          adoptionStatus: 'I',
          materialStatus: 'K', // RQ, CH, etc
          isbn: 'M',
          author: 'O',
          title: 'P',
          rental: 'V',
          newRetailPrice: 'Y',
        }

        let row = 2
        while (typeof firstSheet['A' + row] !== 'undefined') {
          const rowObj = {}
          for (const col in COLUMNS) {
            const cell = COLUMNS[col] + row
            rowObj[col] =
              typeof firstSheet[cell] !== 'undefined'
                ? firstSheet[cell].v.toString().trim()
                : ''
          }
          if (rowObj.newRetailPrice !== '' && rowObj.rental === NOT_RENTAL) {
            this.processRow(rowObj)
          }
          row++
        }
        this.sheets[0].data = this.getAllMaterialCostData()
      }
    },
    onView() {
      this.showPreview = !this.showPreview
      this.previewButtonText = this.showPreview ? 'Hide' : 'Show'
    },
    renderPreview() {
      if (this.workbook() !== null) {
        const sheetNames = this.workbook().SheetNames
        const sheet1 = sheetNames[0]
        this.previewHTML = XLSX.utils.sheet_to_html(
          this.workbook().Sheets[sheet1]
        )
        document.querySelectorAll("[id^='sjs-Y']").forEach((el) => {
          const v = el.getAttribute('v')
          if (v === null || isNaN(v)) {
            return
          }
          if (v.indexOf('.') === -1) {
            el.textContent += '.00'
          } else if (/\.\d$/.test(v)) {
            el.textContent += '0'
          }
          const numericV = parseFloat(v)
          if (numericV > appConfig.noloThreshold) {
            el.closest('tr').setAttribute('nonolo', 'nonolo')
          }
        })
      } else {
        this.previewHTML = ''
      }
    },
  },
}
</script>

<template>
  <Layout>
    <h1>Upload</h1>
    <input
      type="file"
      accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      @change="onChange"
    />
    <BaseButton :disabled="waitingForFile" type="button" @click="onView">
      {{ previewButtonText }}
    </BaseButton>

    <div v-show="showPreview" :class="$style.xlsxpreview">
      <table id="previewTable" v-html="previewHTML"></table>
    </div>

    <XlsxWorkbook>
      <XlsxSheet
        v-for="sheet in sheets"
        :key="sheet.name"
        :collection="sheet.data"
        :sheet-name="sheet.name"
      />
      <XlsxDownload>
        <button v-show="ready">Download</button>
      </XlsxDownload>
    </XlsxWorkbook>
  </Layout>
</template>

<style lang="scss" module>
@import '@design';

.xlsxpreview {
  width: 90%;
  margin-top: 25px;
  table {
    max-height: 75vh;
    padding: 25px;
    overflow: auto;
    background-color: #fffd;

    tbody {
      tr {
        td {
          display: none;
        }
        td:nth-child(5),
        td:nth-child(6),
        td:nth-child(7),
        td:nth-child(15),
        td:nth-child(16),
        td:nth-child(25) {
          display: table-cell;
        }
        td:nth-child(25) {
          text-align: right;
        }
      }

      tr:nth-child(odd) {
        background-color: #7777;
      }

      tr[nonolo] {
        font-weight: 600;
        color: #800;
      }
    }
  }
}
</style>
