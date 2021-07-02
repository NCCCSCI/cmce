const RQ = 'RQ'
const CH = 'CH'
// const RM = 'RM';

class Material {
  constructor(obj) {
    this.isbn = obj.isbn
    this.author = obj.author
    this.title = obj.title
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
      totalCost += this.materials[m].price
    }
    return totalCost
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
