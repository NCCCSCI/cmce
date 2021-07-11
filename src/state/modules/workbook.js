import store from '@state/store'

export const state = {
  workbook: null,
}

export const mutations = {
  SET_WORKBOOK(state, payload) {
    state.workbook = payload.workbook
  },
}

export const actions = {
  setWorkbook({ commit }, workbook) {
    commit('SET_WORKBOOK', { workbook: workbook })

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
        store.dispatch('courseData/processRow', rowObj)
      }
      row++
    }
  },
}
