import appConfig from '@src/app.config'
import axios from 'axios'

export const state = {
  currentUser: getSavedState('auth.currentUser'),
}

export const mutations = {
  SET_CURRENT_USER(state, newValue) {
    state.currentUser = newValue
    saveState('auth.currentUser', newValue)
  },
}

export const getters = {
  // Whether the credentials have been used successfully
  existingCredentials(state) {
    return !!state.currentUser
  },
}

export const actions = {
  // Uses the username/password to request the file from the serves
  getFile({ commit, dispatch, getters }, { username, password } = {}) {
    return axios
      .post(
        appConfig.targetServer,
        { username: username, password: password },
        { responseType: 'blob' }
      )
      .then((response) => {
        // mocking the user - might change this later
        const user = {
          id: -1,
          username: username,
          password: password,
          name: username,
        }
        commit('SET_CURRENT_USER', user)

        return new Response(response.data).arrayBuffer()
      })
      .catch((error) => {
        if (error.response && error.response.status >= 400) {
          commit('SET_CURRENT_USER', null)
        } else {
          console.warn(error)
        }
        return null
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
