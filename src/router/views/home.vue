<script>
import appConfig from '@src/app.config'
import Layout from '@layouts/main.vue'

export default {
  page: {
    title: 'Home',
    meta: [{ name: 'description', content: appConfig.description }],
  },
  components: { Layout },
}
</script>

<template>
  <Layout>
    <h1><BaseIcon name="home" />Course Material Cost Estimator</h1>
    <p
      >Estimates the cost of ownership of required course materials by section
      using an
      <a
        href="https://content.efollett.com/HEOA/library/HEOATextbookProvision.pdf"
        >HEOA</a
      >
      spreadsheet from
      <a href="https://content.efollett.com/HEOA/">Follett</a>.</p
    >
    <p
      ><a href="https://github.com/bgamrat/nolo/blob/main/docs/index.md"
        >Instructions / Documentation</a
      >
    </p>
  </Layout>
</template>
