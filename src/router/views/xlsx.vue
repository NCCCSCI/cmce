<script>
import appConfig from '@src/app.config'
import Layout from '@layouts/main.vue'
// Thanks to: https://vue-xlsx.netlify.app/
import { XlsxRead, XlsxJson, XlsxTable } from 'vue-xlsx'
import { courseMethods } from '@state/helpers'

export default {
  page: {
    title: 'XLSX',
    meta: [{ name: 'description', content: appConfig.description }],
  },
  components: {
    Layout,
    XlsxRead,
    XlsxJson,
    XlsxTable,
  },
  data() {
    return {
      file: null,
      workbook: null,
    }
  },
  methods: {
    ...courseMethods,
    onChange(event) {
      this.file = event.target.files ? event.target.files[0] : null
    },
    onParsed(workbook) {
      this.workbook = workbook
      const sheets = workbook.Sheets
      const firstSheet = sheets[Object.keys(sheets)[0]]

      const CONFIRMED = 'C'
      const COLUMNS = {
        subjectCode: 'E',
        courseNumberAndSection: 'F',
        itemNumber: 'G',
        adoptionStatus: 'I',
        materialStatus: 'K', // RQ, CH, etc
        author: 'O',
        title: 'P',
        rental: 'V',
        newRetailPrice: 'Y',
      }

      let row = 2
      while (typeof firstSheet['A' + row] !== 'undefined') {
        const rowObj = {}
        const strRow = row.toString()
        const courseNumberAndSection = COLUMNS.courseNumberAndSection + strRow
        const confirmCheck = COLUMNS.adoptionStatus + strRow
        if (
          /^\d{3}/.test(firstSheet[courseNumberAndSection].v) &&
          typeof firstSheet[confirmCheck] !== 'undefined' &&
          firstSheet[confirmCheck].v === CONFIRMED
        ) {
          for (const col in COLUMNS) {
            const cell = COLUMNS[col] + row
            rowObj[col] = firstSheet[cell].v
          }
          this.processRow(rowObj)
        }
        row++
      }
    },
  },
}
</script>

<template>
  <Layout>
    <h1>Upload</h1>
    <input type="file" @change="onChange" />
    <XlsxRead :file="file" @parsed="onParsed">
      <XlsxTable />
      <XlsxJson>
        <template v-slot="{ collection }">
          <div>
            {{ collection }}
          </div>
        </template>
      </XlsxJson>
    </XlsxRead>
  </Layout>
</template>
