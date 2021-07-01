/*
const RQ = 'RQ';
const CH = 'CH';
const RM = 'RM';
*/

class Material {
  constructor(author, title, edition, price) {
    this.author = author
    this.title = title
    this.edition = edition
    this.price = price
  }
}

class Section {
  constructor(id) {
    this.id = id
    this.materials = []
  }

  addMaterial(author, title, edition, price) {
    const material = new Material(author, title, edition, price)
    this.materials.push(material)
  }

  get totalCostOfMaterials() {
    let totalCost = 0.0
    this.materials.forEach((obj) => {
      totalCost += obj.price
    })
    return totalCost
  }
}

class Course {
  constructor(subjectCode, courseNumber, sectionId) {
    this.subjectCode = subjectCode
    this.courseNumber = courseNumber
    this.section = new Section(sectionId)
    this.sections = {}
    this.section[sectionId] = new Section(sectionId)
  }
}

class Courses {
  constructor() {
    this.courses = {}
  }

  addCourse(course) {
    const signature = course.subjectCosde + course.courseNumber
    if (typeof this.courses[signature] === 'undefined') {
      this.courses[signature] = course
    }
  }
}

export const state = {
  courses: new Courses(),
}

export const getters = {}

export const mutations = {
  ADD_COURSE(state, course) {
    if (typeof state.courses[course.id] !== 'undefined') {
      state.courses.addCourse(course)
    }
  },
}

export const actions = {
  processRow({ commit, state, rootState }, row) {
    const course = new Course(row.subjectCode, row.courseNumber, row.sectionId)
    commit('ADD_COURSE', course)
  },
}
