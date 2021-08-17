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
    <div :class="$style.credit">
      <strong>Credits</strong>
      <ul>
        <li
          ><a href="https://github.com/bencodezen/vue-enterprise-boilerplate"
            >boilerplate</a
          ></li
        >
        <li><a href="https://github.com/SheetJS/sheetjs">SheetJS</a></li>
        <li><a href="https://vue-xlsx.netlify.app/">Vue-XLSX</a></li>
        <li
          ><a href="https://www.pxfuel.com/en/free-photo-jmumi"
            >background image</a
          ></li
        >
        <li> <a href="favicon.about.txt">favicon</a></li></ul
      >
    </div>
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
div.credit {
  position: fixed;
  right: 5px;
  bottom: 5px;
  padding: 3px;
  font-size: 0.8rem;
  color: $color-credit;
  background-color: #fff;
  * {
    display: inline-block;
    padding: 0;
    margin: 1px;
  }
  ul {
    li {
      margin: 0 5px;
    }
  }
}
</style>
