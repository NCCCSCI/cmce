<script>
import Layout from '@layouts/main.vue'
import { remoteMethods, workbookMethods } from '@state/helpers'

const XLSX = require('xlsx')

export default {
  page: {
    title: 'Download',
    meta: [{ name: 'description', content: `Download XLSX` }],
  },
  components: { Layout },
  data() {
    return {
      username: '',
      password: '',
      authError: null,
      tryingToGetXlsx: false,
    }
  },
  computed: {
    placeholders() {
      return process.env.NODE_ENV === 'production'
        ? {}
        : {
            username: 'Use "demo" to log in to the test server',
            password: 'Use "password" to log in to the test server',
          }
    },
  },
  methods: {
    ...remoteMethods,
    ...workbookMethods,
    // Try to log the user in with the username
    // and password they provided.
    tryToGetXlsx() {
      this.tryingToGetXlsx = true
      // Reset the authError if it existed.
      this.authError = null
      return this.getFile({
        username: this.username,
        password: this.password,
      })
        .then((ab) => {
          this.tryingToGetXlsx = false
          const data = new Uint8Array(ab)
          const workbook = XLSX.read(data, { type: 'array' })
          this.setWorkbook(workbook)
          this.$router.push({ name: 'xlsx' })
        })
        .catch((error) => {
          this.tryingToGetXlsx = false
          this.authError = error
        })
    },
  },
}
</script>

<template>
  <Layout>
    <h1>Get XLSX</h1>
    <p
      >Enter the credentials you received from the bookstore. The most recent
      HEOA spreadsheet will be downloaded and processed.</p
    >
    <form :class="$style.form" @submit.prevent="tryToGetXlsx">
      <BaseInputText
        v-model="username"
        :class="$style.input"
        name="username"
        :placeholder="placeholders.username"
      />
      <BaseInputText
        v-model="password"
        :class="$style.input"
        name="password"
        type="password"
        :placeholder="placeholders.password"
      />
      <BaseButton :disabled="tryingToGetXlsx" type="submit">
        <BaseIcon v-if="tryingToGetXlsx" name="sync" spin />
        <span v-else>
          Go
        </span>
      </BaseButton>
      <p v-if="authError">
        There was an error logging in to your account.
      </p>
    </form>
  </Layout>
</template>

<style lang="scss" module>
@import '@design';

.form {
  text-align: center;
}
.input {
  width: 50%;
  margin: 25px auto;
}
</style>
