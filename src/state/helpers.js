import { mapState, mapGetters, mapActions } from 'vuex'

export const authComputed = {
  ...mapState('auth', {
    currentUser: (state) => state.currentUser,
  }),
  ...mapGetters('auth', ['loggedIn']),
}

export const authMethods = mapActions('auth', ['logIn', 'logOut'])

export const courseComputed = {
  ...mapState('courseData', {
    courses: (state) => state.courses,
  }),
  ...mapGetters('courseData', ['courses']),
}

export const courseMethods = mapActions('courseData', ['processRow'])
