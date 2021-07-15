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
      ftpAuthError: null,
      tryingToGetXlsxFromFTP: false,
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
    onFileChange(event) {
      const self = this
      const files = event.target.files
      const f = files[0]
      const reader = new FileReader()
      reader.onload = function(e) {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        self.setWorkbook(workbook)
        self.$router.push({ name: 'xlsx' })
      }
      reader.readAsArrayBuffer(f)
    },
    // Try to log the user in with the username
    // and password they provided.
    tryToGetXlsxFromFTP() {
      this.tryingToGetXlsxFromFTP = true
      // Reset the authError if it existed.
      this.authError = null
      return this.getFile({
        username: this.username,
        password: this.password,
      })
        .then((ab) => {
          this.tryingToGetXlsxFromFTP = false
          const data = new Uint8Array(ab)
          const workbook = XLSX.read(data, { type: 'array' })
          this.setWorkbook(workbook)
          this.$router.push({ name: 'xlsx' })
        })
        .catch((error) => {
          this.tryingToGetXlsxFromFTP = false
          this.ftpAuthError = error
        })
    },
  },
}
</script>

<template>
  <Layout>
    <article>
      <h1
        >File <BaseIcon name="file-upload" /> Upload /
        <BaseIcon name="file-download" /> Download</h1
      >
      <section>
        <h2>Upload spreadsheet</h2>
        <p>If you have a spreadsheet from the bookstore, upload it here</p>
        <label :class="$style.fileLabel" for="heoaFile">HEOA File</label>
        <input
          id="heoaFile"
          type="file"
          accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          @change="onFileChange"
        />
      </section>
      <section>
        <h2>Get spreadsheet using FTP</h2>
        <p
          >If you have FTP credentials from the bookstore enter them here and
          the latest spreadsheet will be downloaded.</p
        >
        <form @submit.prevent="tryToGetXlsxFromFTP">
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
          <BaseButton :disabled="tryingToGetXlsxFromFTP" type="submit">
            <BaseIcon v-if="tryingToGetXlsxFromFTP" name="sync" spin />
            <span v-else>
              Go
            </span>
          </BaseButton>
          <p v-if="ftpAuthError">
            There was an error logging in to your account.
          </p>
        </form>
      </section>
    </article>
  </Layout>
</template>

<style lang="scss" module>
@import '@design';

.fileLabel {
  padding-right: 10px;
  font-weight: 600;
}

.input {
  width: 50%;
  margin: 25px 0;
}
</style>
