/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "gen" }] */

export const state = {
  db: null,
}

var gen

export const mutations = {
  SET_DB(state, payload) {
    state.db = payload.db
  },
}

export const getters = {
  hasDB(state) {
    return state.db !== null
  },
}

export const actions = {
  init({ commit }) {
    if (typeof window.indexedDB === 'undefined') {
      window.indexedDB =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB
    }

    window.IDBTransaction = window.IDBTransaction ||
      window.webkitIDBTransaction ||
      window.msIDBTransaction || { READ_WRITE: 'readwrite' } // This line should only be needed if it is needed to support the object's constants for older browsers
    window.IDBKeyRange =
      window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

    if (!window.indexedDB) {
      alert(
        'Unsupported browser, difference feature will not be supported. Use Firefox.'
      )
    }

    let db = {}

    db = window.indexedDB.open('nolo', 3)

    db.onsuccess = function(event) {
      const ldb = event.target.result
      commit('SET_DB', { db: ldb })
    }

    db.onupgradeneeded = function(event) {
      const ldb = event.target.result
      const objectStore = ldb.createObjectStore('sections', { keyPath: 'crn' })
      objectStore.createIndex('sections', 'crn', { unique: true })
    }
  },
  updateDB({ state }, payload) {
    return new Promise((resolve) => {
      // thanks to: https://stackoverflow.com/a/11045107/2182349
      function* generator(state, payload) {
        let data
        let changed = false
        const totalCostOfMaterials = payload.totalCostOfMaterials

        const request = objectStore.get(payload.crn)
        request.onsuccess = grabEventAndContinueHandler
        const genEvent = yield
        if (typeof genEvent.target.result === 'undefined') {
          // entry doesn't exist, add it
          data = {}
          data.crn = payload.crn
          data.tcom = totalCostOfMaterials
          changed = true
          const requestAdd = objectStore.add(data)
          requestAdd.onsuccess = grabEventAndContinueHandler
          yield
        } else {
          // get the old value, check it, update it
          data = genEvent.target.result
          if (data.tcom !== totalCostOfMaterials) {
            data.tcom = totalCostOfMaterials
            changed = true
          }
          // put updated object back into the database.
          const requestUpdate = objectStore.put(data)
          requestUpdate.onsuccess = grabEventAndContinueHandler
          yield
        }
        return changed
      }

      const objectStore = state.db
        .transaction(['sections'], 'readwrite')
        .objectStore('sections')
      objectStore.index('sections')

      const gen = generator(state, payload)
      gen.next()

      function grabEventAndContinueHandler(event) {
        const result = gen.next(event)
        if (result.done) {
          resolve(result.value)
        }
      }
    })
  },
}
