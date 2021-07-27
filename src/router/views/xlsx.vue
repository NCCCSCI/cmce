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
    title: 'Compute Estimates',
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
      previewHTML: '',
      pricesFormatted: false,
    }
  },
  mounted() {
    if (this.hasWorkbook()) {
      this.processSheet()
    } else {
      this.$router.push({ name: 'get-file' })
    }
  },
  updated() {
    if (this.pricesFormatted === false) {
      document.querySelectorAll("[id^='sjs-Y']").forEach((el) => {
        const v = el.getAttribute('v')
        if (v === null) {
          return
        }
        const tc = el.textContent
        if (tc.indexOf('.') === -1) {
          el.textContent += '.00'
        } else if (/\.\d$/.test(tc)) {
          el.textContent += '0'
        }
      })
      this.pricesFormatted = true
    }
    this.highlightPreview()
  },
  methods: {
    ...courseComputed,
    ...courseMethods,
    ...workbookComputed,
    ...workbookMethods,
    processSheet() {
      this.downloadReady = false
      if (this.hasWorkbook) {
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
          crn: 'AC',
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
          'CRN',
          'Subject Code',
          'Course Number',
          'Section Id',
          'Estimated Cost of Materials',
          'Notes',
        ])
        this.downloadReady = true
        this.renderPreview()
      }
    },
    renderPreview() {
      this.previewHTML = ''
      if (this.hasWorkbook) {
        const sheetNames = this.workbook().SheetNames
        const sheet1 = sheetNames[0]
        this.previewHTML = XLSX.utils.sheet_to_html(
          this.workbook().Sheets[sheet1]
        )
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
      Compute Estimates</h1
    >
    <h2>Preview</h2>
    <div :class="$style.block">
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

    <div :class="$style.xlsxpreview">
      <p
        >The preview shows <em>all</em> the materials and highlights those less
        than the threshold. It is intended for a quick check to ensure the
        spreadsheet data is as expected.
        <strong :class="$style.warning"
          >Do not use this for cost estimates.</strong
        ></p
      >
      <table id="previewTable" v-html="previewHTML"></table>
    </div>
  </Layout>
</template>

<style lang="scss" module>
@import '@design';

.block {
  border-bottom: 1px solid #fff;
  span {
    margin: 0 7px;
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
  color: #c44d01;
  background-color: #fff;
}

.xlsxpreview {
  width: 90%;
  margin-top: 25px;
  table {
    max-height: 75vh;
    padding: 25px;
    overflow: auto;
    color: #626262;
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
        background-color: #f6dccb;
      }
    }
  }
  p {
    line-height: 1.5rem;
  }
}
</style>
