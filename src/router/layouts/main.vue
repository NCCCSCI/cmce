<script>
import NavBar from '@components/nav-bar.vue'

export default {
  components: { NavBar },
}
</script>

<template>
  <div :class="$style.container">
    <NavBar />
    <slot />
    <p :class="$style.credit"
      ><a href="https://www.flickr.com/photos/41346951@N05/9563685450"
        >"STHLM #8" by Thomas Leuthard</a
      >
      is licensed with CC BY 2.0. To view a copy of this license, visit
      <a href="https://creativecommons.org/licenses/by/2.0/"
        >https://creativecommons.org/licenses/by/2.0/</a
      ></p
    >
  </div>
</template>

<style lang="scss" module>
@import '@design';

.container {
  min-width: $size-content-width-min;
  max-width: $size-content-width-max;
  padding: 25px;
  margin: 100px auto;
  background-color: $color-container-bg;
}
.credit {
  position: fixed;
  right: 5px;
  bottom: 5px;
  color: $color-credit;
}
</style>
