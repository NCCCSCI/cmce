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
      sheets: [{ name: 'NoLo', data: [] }],
      ready: false,
    }
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

      const CONFIRMED = 'C'
      const NOT_RENTAL = 'N'
      const COLUMNS = {
        subjectCode: 'E',
        courseNumber: 'F',
        sectionId: 'G',
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
        const strRow = row.toString()
        const confirmCheck = COLUMNS.adoptionStatus + strRow
        if (
          typeof firstSheet[confirmCheck] !== 'undefined' &&
          firstSheet[confirmCheck].v === CONFIRMED
        ) {
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
        }
        row++
      }

      this.sheets[0].data = this.getAllMaterialCostData()
      this.ready = true
    },
  },
}
</script>

<template>
  <Layout>
    <h1>Upload</h1>
    <input type="file" @change="onChange" />
    <XlsxRead :file="file" @parsed="onRead">
      <XlsxTable hidden />
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
