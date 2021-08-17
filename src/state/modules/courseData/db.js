/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "gen" }] */

export const state = {
  db: null,
  delta: [],
}

var gen

export const mutations = {
  SET_DB(state, payload) {
    state.db = payload.db
  },

  UPDATE_DB(state, payload) {
    // thanks to: https://stackoverflow.com/a/11045107/2182349
    function* generator(state, payload) {
      const sectionSignature = payload.courseSignature + '-' + payload.sectionId
      const totalCostOfMaterials = payload.totalCostOfMaterials

      const objectStore = state.db
        .transaction(['sections'], 'readwrite')
        .objectStore('sections')
      objectStore.index('signature')
      const request = objectStore.get(sectionSignature)

      request.onsuccess = grabEventAndContinueHandler

      let genEvent = yield

      if (typeof genEvent.target.result === 'undefined') {
        // entry doesn't exist, add it
        const obj = {}
        obj.s = sectionSignature
        obj.tcom = totalCostOfMaterials
        obj.chg = false
        obj.upd = null
        const requestAdd = objectStore.add(obj)

        requestAdd.oncompleted = grabEventAndContinueHandler
        genEvent = yield
      } else {
        // get the old value, check it, update it
        const data = genEvent.target.result

        data.chg = false
        data.upd = Date.now()
        if (data.tcom !== totalCostOfMaterials) {
          data.tcom = totalCostOfMaterials
          data.chg = true
          state.delta.push(sectionSignature)
        }
        // Put this updated object back into the database.
        const requestUpdate = objectStore.put(data)

        requestUpdate.oncompleted = grabEventAndContinueHandler
        genEvent = yield
      }
    }

    const gen = generator(state, payload)
    gen.next()

    function grabEventAndContinueHandler(event) {
      gen.next(event)
    }
  },
}

export const getters = {
  hasDB(state) {
    return state.db !== null
  },
}

export const actions = {
  init({ commit }) {
    // In the following line, you should include the prefixes of implementations you want to test.
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
      const objectStore = ldb.createObjectStore('sections', { keyPath: 's' })
      objectStore.createIndex('signature', 's', { unique: true })
    }
  },
  updateDB({ commit }, data) {
    commit('UPDATE_DB', {
      courseSignature: data.courseSignature,
      sectionId: data.sectionId,
      totalCostOfMaterials: data.totalCostOfMaterials,
    })
  },
}
