<script>
import appConfig from '@src/app.config'
import Layout from '@layouts/main.vue'
// Thanks to: https://vue-xlsx.netlify.app/
import {
  XlsxRead,
  XlsxTable,
  XlsxWorkbook,
  XlsxSheet,
  XlsxDownload,
} from 'vue-xlsx'
import { courseComputed, courseMethods } from '@state/helpers'

export default {
  page: {
    title: 'XLSX',
    meta: [{ name: 'description', content: appConfig.description }],
  },
  components: {
    Layout,
    XlsxRead,
    XlsxTable,
    XlsxWorkbook,
    XlsxSheet,
    XlsxDownload,
  },
  data() {
    return {
      file: null,
      workbook: null,
      sheets: [{ name: 'NoLo', data: [{}] }],
      ready: false,
      previewReady: false,
      previewButtonText: 'View',
      showPreview: false,
    }
  },
  computed: {
    waitingForFile() {
      return this.file === null
    },
  },
  methods: {
    ...courseComputed,
    ...courseMethods,
    onChange(event) {
      this.file = event.target.files ? event.target.files[0] : null
    },
    onRead(workbook) {
      this.workbook = workbook
      const sheets = workbook.Sheets
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
      this.ready = true
    },
    onView() {
      if (!this.previewReady) {
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
      }
      this.previewReady = true
      this.showPreview = !this.showPreview
      this.previewButtonText = this.showPreview ? 'Hide' : 'Show'
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
    <XlsxRead :file="file" @parsed="onRead">
      <XlsxTable v-show="showPreview" :class="$style.xlsxpreview" />
    </XlsxRead>
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
  table {
    max-height: 75vh;
    overflow: auto;

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
