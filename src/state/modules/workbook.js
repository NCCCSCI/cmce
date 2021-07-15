export const state = {
  workbook: null,
}

export const mutations = {
  SET_WORKBOOK(state, payload) {
    state.workbook = payload.workbook
  },
}

export const getters = {
  // Whether the user is currently logged in.
  hasWorkbook(state) {
    return state.workbook !== null
  },
}

export const actions = {
  setWorkbook({ commit }, workbook) {
    commit('SET_WORKBOOK', { workbook: workbook })
  },
}
