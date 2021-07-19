<script>
import appConfig from '@src/app.config'
import Layout from '@layouts/main.vue'
import documentation from '@/README.md'

export default {
  page: {
    title: 'Home',
    meta: [{ name: 'description', content: appConfig.description }],
  },
  components: { Layout },
  data() {
    return {
      md: documentation.replace(/public\//g, '').replace(/<h1.*<\/h1>/, ''),
    }
  },
}
</script>

<template>
  <Layout>
    <h1><BaseIcon name="home" /> Course Material Cost Estimator</h1>
    <div :class="$style.md" v-html="md"></div>
  </Layout>
</template>

<style lang="scss" module>
@import '@design';
.md {
  ul:first-of-type {
    display: flex;
    justify-content: flex-start;
    padding: 0;
    margin: 0;
    li {
      margin-right: 10px;
      list-style-type: none;
      a {
        color: $color-nav-link-text;
      }
    }
  }
  img {
    padding: 10px 0;
    filter: drop-shadow(0 0 0.25rem #000);
  }
}
</style>
