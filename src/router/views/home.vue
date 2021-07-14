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
      >This tool will estimate the cost of required course materials by section
      using an
      <a
        href="https://content.efollett.com/HEOA/library/HEOATextbookProvision.pdf"
        >HEOA</a
      >
      spreadsheet.</p
    >
    <p
      ><a href="https://github.com/bgamrat/nolo/blob/main/docs/index.md"
        >Instructions / Documentation</a
      >
    </p>
    <em>Notes</em>
    <ul>
      <li>
        The <em>highest</em> cost of any given material is used. For example, if
        there are three options for the same book, the most expensive is used in
        case that is the only item available.
      </li>
      <li
        >If materials are marked as <em>choice</em>, the cost cannot be
        estimated and a note is included in the output</li
      >
      <li
        >Sections which are marked as <em>no text</em> are reported as zero
        cost, with the text 'No text'</li
      >
      <li>Comments and suggestions are welcome</li>
      <li
        >FTP credentials may be used to access updated files, please contact
        your Bookstore Manager with respect to credentials</li
      >
    </ul>
  </Layout>
</template>
