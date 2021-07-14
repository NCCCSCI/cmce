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
      noloThreshold: appConfig.noloThreshold,
      waitingForFile: true,
      sheets: [{ name: 'NoLo', data: [[]] }],
      downloadReady: false,
      previewButtonText: 'View',
      showPreview: false,
      previewHTML: '',
    }
  },
  mounted() {
    if (this.workbook() !== null) {
      this.waitingForFile = false
      this.processSheet()
    }
  },
  methods: {
    ...courseComputed,
    ...courseMethods,
    ...workbookComputed,
    ...workbookMethods,
    onFileChange(event) {
      const self = this
      const files = event.target.files
      const f = files[0]
      const reader = new FileReader()
      reader.onload = function(e) {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        self.setWorkbook(workbook)
        self.waitingForFile = false
        self.processSheet()
      }
      reader.readAsArrayBuffer(f)
    },
    processSheet() {
      this.downloadReady = false
      if (this.workbook() !== null) {
        const sheets = this.workbook().Sheets
        const firstSheet = sheets[Object.keys(sheets)[0]]

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
          this.processRow(rowObj)
          row++
        }
        this.sheets[0].data = this.getAllMaterialCostData()
        this.sheets[0].data.unshift([
          'Subject Code',
          'Course Number',
          'Section Id',
          'Estimated Cost of Materials',
          'Notes',
        ])
        this.downloadReady = true
        this.renderPreview()
        this.highlightPreview()
      }
    },
    onView() {
      this.showPreview = !this.showPreview
      this.previewButtonText = this.showPreview ? 'Hide' : 'Show'
    },
    renderPreview() {
      this.previewHTML = ''
      if (this.workbook() !== null) {
        const sheetNames = this.workbook().SheetNames
        const sheet1 = sheetNames[0]
        this.previewHTML = XLSX.utils.sheet_to_html(
          this.workbook().Sheets[sheet1]
        )
        document.querySelectorAll("[id^='sjs-Y']").forEach((el) => {
          const v = el.getAttribute('v')
          if (v === null) {
            return
          }
          if (v.indexOf('.') === -1) {
            el.textContent += '.00'
          } else if (/\.\d$/.test(v)) {
            el.textContent += '0'
          }
        })
      }
    },
    highlightPreview() {
      document.querySelectorAll("[id^='sjs-Y']").forEach((el) => {
        const numericV = parseFloat(el.getAttribute('v'))
        const tr = el.closest('tr')
        if (isNaN(numericV) || numericV <= this.noloThreshold) {
          tr.setAttribute('nolomaybe', 'true')
        } else {
          tr.removeAttribute('nolomaybe')
        }
      })
    },
  },
}
</script>

<template>
  <Layout>
    <h1>
      <BaseIcon name="file-excel" />
      XLSX</h1
    >
    <div :class="$style.block">
      <span>
        <label for="heoaFile">HEOA File</label>
        <input
          id="heoaFile"
          type="file"
          accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          @change="onFileChange"
        />
      </span>
      <span>
        <label for="noloThreshold">Threshold</label>
        <BaseInputText
          id="noloThreshold"
          v-model="noloThreshold"
          :class="[$style.noloThreshold, $style.input]"
          type="text"
          pattern="\d{3}"
          @change="highlightPreview"
        />
      </span>
      <span>
        <BaseButton :disabled="waitingForFile" type="button" @click="onView">
          {{ previewButtonText }}
        </BaseButton>
      </span>
      <span>
        <XlsxWorkbook>
          <XlsxSheet
            v-for="sheet in sheets"
            :key="sheet.name"
            :collection="sheet.data"
            :sheet-name="sheet.name"
          />
          <XlsxDownload filename="HEOA-ECOM.xlsx">
            <BaseButton v-show="downloadReady" type="button"
              >Download</BaseButton
            >
          </XlsxDownload>
        </XlsxWorkbook>
      </span>
    </div>
    <div v-show="showPreview" :class="$style.xlsxpreview">
      <p
        >The preview shows <em>all</em> the materials and highlights those less
        than the threshold. It is intended for a quick check to ensure the
        spreadsheet data is as expected.
        <strong :class="$style.warning"
          >Do not use this for cost estimates</strong
        >.</p
      >
      <table id="previewTable" v-html="previewHTML"></table>
    </div>
  </Layout>
</template>

<style lang="scss" module>
@import '@design';

.block {
  padding: 15px 0;
  margin: 10px 0;
  span {
    margin: 7px;
    div {
      display: inline;
    }
  }
  label {
    padding-right: 10px;
    font-weight: 600;
  }
}

.noloThreshold {
  display: inline-block;
  width: 5rem;
  text-align: right;
}

.warning {
  color: #354650;
  background-color: #fff;
}

.xlsxpreview {
  width: 90%;
  margin-top: 25px;
  table {
    max-height: 75vh;
    padding: 25px;
    overflow: auto;
    color: #aaa;
    background-color: #fff;

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
        background-color: #d4e5f0;
      }

      tr[nolomaybe] {
        font-weight: 600;
        color: green;
      }
    }
  }
}
</style>
