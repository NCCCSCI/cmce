/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "gen" }] */

export const state = {
  db: null,
  // updated is the list of crns that were passed to the updateDB action
  updated: [],
}
var gen

export const mutations = {
  CLEAR_UPDATED(state) {
    state.updated = []
  },
  SET_DB(state, payload) {
    state.db = payload.db
  },
  ADD_TO_UPDATED(state, payload) {
    state.updated.push(payload.crn)
  },
}

export const getters = {
  hasDB(state) {
    return state.db !== null
  },
}

export const actions = {
  setup({ commit }, storeId) {
    return new Promise((resolve) => {
      commit('CLEAR_UPDATED')
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

      db = window.indexedDB.open('cmce', 3)

      db.onsuccess = function(event) {
        const ldb = event.target.result
        commit('SET_DB', { db: ldb })
        resolve()
      }

      db.onupgradeneeded = function(event) {
        const ldb = event.target.result
        const objectStore = ldb.createObjectStore(storeId, { keyPath: 'crn' })
        objectStore.createIndex(storeId, 'crn', { unique: true })
      }
    })
  },
  updateDB({ state, commit }, payload) {
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
        .transaction([payload.storeId], 'readwrite')
        .objectStore(payload.storeId)
      objectStore.index(payload.storeId)
      // keep track of all the crns (keys) which were updated
      commit('ADD_TO_UPDATED', { crn: payload.crn })

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
  cleanUpDB({ state }, storeId) {
    const objectStore = state.db
      .transaction([storeId], 'readwrite')
      .objectStore(storeId)
    const request = objectStore.getAllKeys()
    request.onsuccess = function(event) {
      const keys = event.target.result
      for (const key of keys) {
        if (state.updated.indexOf(key) === -1) {
          // delete any crns which weren't updated
          objectStore.delete(key)
        }
      }
    }
  },
}
