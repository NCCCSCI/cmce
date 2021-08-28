// adoption status
const C = 'C' // Confirmed
const NT = 'NT' // No Text

// item type indicator
const RQ = 'RQ' // Required
const CH = 'CH' // Choice

// eBook type
const WEB = 'WEB' // Web eBook (subscription)

// text which may be in the title to indicate subscription items
const subscription = 'subscription' // (subscription)

class Material {
  constructor(obj) {
    this.isbn = obj.isbn
    this.author = obj.author
    this.title = obj.title
    this.status = obj.materialStatus
    this.note = obj.note
    this.itemTypeIndicator = obj.itemTypeIndicator
    this.eBookType = obj.eBookType
    if (obj.newRetailPrice === '') {
      if (obj.usedRetailPrice !== '') {
        obj.newRetailPrice = obj.usedRetailPrice
      }
    }
    let price = parseFloat(obj.newRetailPrice)
    if (isNaN(price)) {
      price = null
    }
    this.price = price
  }

  get signature() {
    if (this.title !== '') {
      const re1 = new RegExp(`\b(THE|A|OF|IS|AN|AND|(${this.author}))\b`, 'gi')
      const re2 = /(\s*\([^)]+\))/g
      return this.title
        .replace(re1, '')
        .replace(re2, '')
        .replace(/\W/g, '')
        .toUpperCase()
    } else {
      return 'no-title'
    }
  }
}

class Section {
  constructor(crn, id, instructorLastName, instructorFirstName) {
    this.crn = crn
    this.id = id
    this.instructorLastName = instructorLastName
    this.instructorFirstName = instructorFirstName
    this.materials = {}
    this.changedSinceLastRun = false
  }

  addMaterial(material) {
    // capture the material with the HIGHEST cost of ownership
    const signature = material.signature
    if (typeof this.materials[signature] === 'undefined') {
      this.materials[signature] = material
      return
    }

    const existing = this.materials[signature]
    if (material.price < existing.price) {
      return
    }
    this.materials[signature].price = material.price
  }

  get totalCostOfMaterials() {
    let totalCost = 0.0
    let totalWebCost = 0.0
    for (const m in this.materials) {
      const material = this.materials[m]
      if (
        !isNaN(material.price) &&
        (material.status === RQ || material.status === CH)
      ) {
        if (material.eBookType === WEB) {
          totalWebCost += material.price
        } else {
          totalCost += material.price
        }
      }
    }
    // this prevents courses with web only resources from being reported as zero cost
    // in most casts, web cost is less than print cost and it is an alternate version of the text
    if (totalCost === 0.0 && totalWebCost !== 0.0) {
      totalCost += totalWebCost
    }

    return totalCost
  }

  get notes() {
    if (Object.keys(this.materials).length === 0) {
      return 'No materials'
    }
    let allRQ = true
    let notes = ''
    for (const m in this.materials) {
      const material = this.materials[m]
      if (material.status === CH) {
        allRQ = false
      }
      if (material.note !== '' && notes.indexOf(material.note) === -1) {
        notes += material.note + ' '
      }
    }
    if (!allRQ) {
      notes = '*** One or more of the materials is a CHOICE *** ' + notes
    }
    return notes
  }
}

class Course {
  constructor(subjectCode, courseNumber) {
    this.subjectCode = subjectCode
    this.courseNumber = courseNumber
    this.sections = {}
  }

  addSection(section) {
    if (typeof this.sections[section.crn] === 'undefined') {
      this.sections[section.crn] = section
    }
  }

  get signature() {
    return this.subjectCode + this.courseNumber
  }
}

export const state = {
  courses: {},
}

export const getters = {
  getAllMaterialCostData(state) {
    const rows = []
    for (const c in state.courses) {
      const course = state.courses[c]
      for (const s in course.sections) {
        const section = course.sections[s]
        rows.push([
          section.crn,
          course.subjectCode,
          course.courseNumber,
          section.id,
          section.totalCostOfMaterials,
          section.notes,
          section.instructorLastName,
          section.instructorFirstName,
          section.changedSinceLastRun ? 'changed' : '',
        ])
      }
    }
    return rows
  },
}

export const mutations = {
  CLEAR_COURSES(state) {
    state.courses = {}
  },

  ADD_COURSE(state, payload) {
    const signature = payload.course.signature
    if (typeof state.courses[signature] === 'undefined') {
      state.courses[signature] = payload.course
    }
  },

  ADD_SECTION(state, payload) {
    state.courses[payload.course.signature].addSection(payload.section)
  },

  SET_SECTION_CHANGED(state, payload) {
    state.courses[payload.course.signature].sections[
      payload.section.crn
    ].changedSinceLastRun = true
  },

  ADD_MATERIAL(state, payload) {
    state.courses[payload.course.signature].sections[
      payload.section.crn
    ].addMaterial(payload.material)
  },
}

export const actions = {
  clear({ commit }) {
    commit('CLEAR_COURSES')
  },

  processRow({ commit, state, rootState }, rowObj) {
    try {
      if (rowObj.adoptionStatus !== C && rowObj.adoptionStatus !== NT) {
        return
      }
      const course = new Course(rowObj.subjectCode, rowObj.courseNumber)
      commit('ADD_COURSE', { course: course })
      const section = new Section(
        rowObj.crn,
        rowObj.sectionId,
        rowObj.instructorLastName,
        rowObj.instructorFirstName
      )
      commit('ADD_SECTION', { course: course, section: section })
      if (rowObj.adoptionStatus === NT) {
        return
      }
      if (rowObj.title.toLowerCase().includes(subscription)) {
        return
      }
      const material = new Material(rowObj)
      commit('ADD_MATERIAL', {
        course: course,
        section: section,
        material: material,
      })
    } catch (e) {
      // TODO
    }
  },
  async deltaCheck({ commit, state }) {
    // update the database - persistent storage
    // this also sets up the delta data
    for (const c in state.courses) {
      const course = state.courses[c]
      for (const s in course.sections) {
        const section = course.sections[s]
        await this.dispatch('courseData/db/updateDB', {
          crn: section.crn,
          totalCostOfMaterials: section.totalCostOfMaterials,
        }).then((changed) => {
          if (changed) {
            commit('SET_SECTION_CHANGED', { course: course, section: section })
          }
        })
      }
    }
    await this.dispatch('courseData/db/cleanUpDB')
  },
}
