import appConfig from '@src/app.config'
import axios from 'axios'

const LOCAL_STORAGE_KEY = 'cmce.remote.currentUser'

export const state = {
  currentUser: getSavedState(LOCAL_STORAGE_KEY),
}

export const mutations = {
  SET_CURRENT_USER(state, newValue) {
    state.currentUser = newValue
    saveState(LOCAL_STORAGE_KEY, newValue)
    if (newValue === null) {
      clearState(LOCAL_STORAGE_KEY)
    }
  },
}

export const getters = {
  // Whether the credentials have been used successfully
  existingCredentials(state) {
    return !!state.currentUser
  },
  getCurrentUser(state) {
    return state.currentUser
  },
}

export const actions = {
  // Uses the storeId/username/password to request the file from the serves
  getFile({ commit, dispatch, getters }, { storeId, username, password } = {}) {
    return axios
      .post(
        appConfig.targetServer,
        { store_id: storeId, username: username, password: password },
        { responseType: 'blob' }
      )
      .then((response) => {
        const user = {
          storeId: storeId,
          username: username,
          password: password,
        }
        commit('SET_CURRENT_USER', user)
        return new Response(response.data).arrayBuffer()
      })
      .catch((error) => {
        if (error.response && error.response.status >= 400) {
          commit('SET_CURRENT_USER', null)
        }
        return error
      })
  },

  // Clears the stored credentials
  clearCredentials({ commit }) {
    commit('SET_CURRENT_USER', null)
  },
}

// ===
// Private helpers
// ===

function getSavedState(key) {
  return JSON.parse(window.localStorage.getItem(key))
}

function saveState(key, state) {
  window.localStorage.setItem(key, JSON.stringify(state))
}

function clearState(key) {
  window.localStorage.clear(key)
}
