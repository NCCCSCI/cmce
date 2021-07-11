const RQ = 'RQ' // Required
const CH = 'CH' // Choice

class Material {
  constructor(obj) {
    this.isbn = obj.isbn
    this.author = obj.author
    this.title = obj.title
    this.status = obj.materialStatus
    this.note = obj.note
    const price = parseFloat(obj.newRetailPrice)
    if (isNaN(price)) {
      throw new Error('No new retail price ' + obj.newRetailPrice)
    }
    this.price = price
  }

  get signature() {
    const re = new RegExp(`\b(THE|A|OF|IS|AN|AND|(${this.author}))\b`, 'gi')
    return this.title
      .replace(re, '')
      .replace(/\W/g, '')
      .toUpperCase()
  }
}

class Section {
  constructor(id) {
    this.id = id
    this.materials = {}
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
    for (const m in this.materials) {
      if (this.materials[m].status !== RQ) {
        return '---' // if any of the materials are not REQUIRED - the cost can't be reliably reported
      }
      totalCost += this.materials[m].price
    }
    return totalCost // .toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
  }

  get notes() {
    let allRQ = true
    let notes = ''
    for (const m in this.materials) {
      if (this.materials[m].status !== RQ) {
        allRQ = false
      }
      if (
        this.materials[m].note !== '' &&
        notes.indexOf(this.materials[m].note) === -1
      ) {
        notes += this.materials[m].note + '  \n'
      }
    }
    if (!allRQ) {
      notes = '*** One or more of the materials is a CHOICE ***  \n' + notes
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
    if (typeof this.sections[section.id] === 'undefined') {
      this.sections[section.id] = section
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
          course.subjectCode,
          course.courseNumber,
          section.id,
          section.totalCostOfMaterials,
          section.notes,
        ])
      }
    }
    return rows
  },
}

export const mutations = {
  ADD_COURSE(state, payload) {
    const signature = payload.course.signature
    if (typeof state.courses[signature] === 'undefined') {
      state.courses[signature] = payload.course
    }
  },

  ADD_SECTION(state, payload) {
    state.courses[payload.course.signature].addSection(payload.section)
  },

  ADD_MATERIAL(state, payload) {
    state.courses[payload.course.signature].sections[
      payload.section.id
    ].addMaterial(payload.material)
  },
}

export const actions = {
  processRow({ commit, state, rootState }, rowObj) {
    if (rowObj.materialStatus === RQ || rowObj.materialStatus === CH) {
      try {
        const course = new Course(rowObj.subjectCode, rowObj.courseNumber)
        commit('ADD_COURSE', { course: course })
        const section = new Section(rowObj.sectionId)
        commit('ADD_SECTION', { course: course, section: section })
        const material = new Material(rowObj)
        commit('ADD_MATERIAL', {
          course: course,
          section: section,
          material: material,
        })
      } catch (e) {
        // TODO
      }
    }
  },
}
