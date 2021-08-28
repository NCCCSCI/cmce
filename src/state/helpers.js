import { mapState, mapGetters, mapActions } from 'vuex'

export const courseComputed = {
  ...mapState('courseData', {
    courses: (state) => state.courses,
  }),
}

export const courseMethods = mapActions('courseData', [
  'clearMaterialData',
  'processRow',
  'getAllMaterialCostData',
])

export const workbookComputed = {
  ...mapState('workbook', {
    workbook: (state) => state.workbook,
  }),
  ...mapGetters('workbook', ['hasWorkbook']),
}

export const workbookMethods = mapActions('workbook', ['setWorkbook'])

export const remoteComputed = {
  ...mapState('remote', {
    currentUser: (state) => state.currentUser,
  }),
  ...mapGetters('remote', ['existingCredentials', 'getCurrentUser']),
}

export const remoteMethods = mapActions('remote', [
  'getFile',
  'clearCredentials',
])
