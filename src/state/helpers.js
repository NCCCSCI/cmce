import { mapState, mapGetters, mapActions } from 'vuex'

export const courseComputed = {
  ...mapState('courseData', {
    courses: (state) => state.courses,
  }),
  ...mapGetters('courseData', ['getAllMaterialCostData']),
}

export const courseMethods = mapActions('courseData', ['processRow'])

export const workbookComputed = {
  ...mapState('workbook', {
    workbook: (state) => state.workbook,
  }),
}

export const workbookMethods = mapActions('workbook', ['setWorkbook'])

export const remoteComputed = {
  ...mapState('remote', {
    currentUser: (state) => state.currentUser,
  }),
  ...mapGetters('remote', ['existingCredentials']),
}

export const remoteMethods = mapActions('remote', [
  'getFile',
  'clearCredentials',
])
