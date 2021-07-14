<script>
import { remoteComputed } from '@state/helpers'
import NavBarRoutes from './nav-bar-routes.vue'

export default {
  components: { NavBarRoutes },
  data() {
    return {
      persistentNavRoutes: [
        {
          name: 'home',
          title: 'Home',
        },
        {
          name: 'xlsx',
          title: () => 'XLSX',
        },
        {
          name: 'get-file',
          title: () => 'Get XLSX',
        },
      ],
      loggedInNavRoutes: [
        {
          name: 'profile',
          title: () => 'Logged in as ' + this.currentUser.name,
        },
        {
          name: 'logout',
          title: 'Log out',
        },
      ],
      loggedOutNavRoutes: [],
    }
  },
  computed: {
    ...remoteComputed,
  },
}
</script>

<template>
  <ul :class="$style.container">
    <NavBarRoutes :routes="persistentNavRoutes" />
    <NavBarRoutes v-if="existingCredentials" :routes="loggedInNavRoutes" />
    <NavBarRoutes v-else :routes="loggedOutNavRoutes" />
  </ul>
</template>

<style lang="scss" module>
@import '@design';

.container {
  padding: 0;
  margin: 0 0 $size-grid-padding;
  text-align: center;
  list-style-type: none;
  background-color: #fff5;
  > li {
    display: inline-block;
    margin-right: $size-grid-padding;
  }
  a {
    @extend %typography-medium;

    font-weight: 500;
    color: $color-nav-link-text;
  }
}
</style>
