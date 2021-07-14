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
    <p :class="$style.credit">
      <a href="https://www.pxfuel.com/en/free-photo-jmumi">Image credit</a></p
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
