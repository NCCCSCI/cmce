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
      const COURSE_NUMBER_LENGTH = 3

      let row = 2
      while (typeof firstSheet['A' + row] !== 'undefined') {
        const rowObj = {}
        const strRow = row.toString()
        const courseNumberAndSection = COLUMNS.courseNumberAndSection + strRow
        const confirmCheck = COLUMNS.adoptionStatus + strRow
        const courseNumber =
          typeof firstSheet[courseNumberAndSection] !== 'undefined'
            ? firstSheet[courseNumberAndSection].v.toString()
            : ''
        const re = new RegExp('^\\d{' + COURSE_NUMBER_LENGTH + '}')
        if (
          re.test(courseNumber) &&
          typeof firstSheet[confirmCheck] !== 'undefined' &&
          firstSheet[confirmCheck].v === CONFIRMED
        ) {
          for (const col in COLUMNS) {
            const cell = COLUMNS[col] + row
            rowObj[col] = firstSheet[cell].v
          }
          rowObj.courseNumber = courseNumber.substring(0, COURSE_NUMBER_LENGTH)
          rowObj.sectionId = courseNumber.substring(COURSE_NUMBER_LENGTH)
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
