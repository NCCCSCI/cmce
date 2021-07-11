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
  },
}
