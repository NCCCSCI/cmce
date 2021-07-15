<script>
import { remoteComputed, workbookComputed } from '@state/helpers'
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
          name: 'get-file',
          title: () => 'Get Spreadsheet',
        },
      ],
      fileReadyNavRoutes: [
        {
          name: 'xlsx',
          title: () => 'Compute Estimates',
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
    ...workbookComputed,
  },
}
</script>

<template>
  <ul :class="$style.container">
    <NavBarRoutes :routes="persistentNavRoutes" />
    <NavBarRoutes v-if="hasWorkbook" :routes="fileReadyNavRoutes" />
    <NavBarRoutes v-if="existingCredentials" :routes="loggedInNavRoutes" />
    <NavBarRoutes v-else :routes="loggedOutNavRoutes" />
  </ul>
</template>

<style lang="scss" module>
@import '@design';

.container {
  padding: 5px;
  margin: 0 0 $size-grid-padding;
  text-align: center;
  list-style-type: none;
  background-color: #fff5;
  > li {
    display: inline-block;
    margin-right: $size-grid-padding;
  }
  a {
    @extend %typography-small;

    color: $color-nav-link-text;
  }
}
</style>
