<script>
import Layout from '@layouts/main.vue'
import { remoteComputed, remoteMethods, workbookMethods } from '@state/helpers'

const XLSX = require('xlsx')

export default {
  page: {
    title: 'Download',
    meta: [{ name: 'description', content: `Download XLSX` }],
  },
  components: { Layout },
  data() {
    return {
      storeId: '',
      username: '',
      password: '',
      ftpAuthError: null,
      tryingToGetXlsxFromFTP: false,
      error: false,
      errorMessage: '',
    }
  },
  mounted() {
    const currentUser = this.getCurrentUser()
    if (currentUser !== null) {
      this.storeId = currentUser.storeId
      this.username = currentUser.username
      this.password = currentUser.password
    }
  },
  methods: {
    ...remoteComputed,
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
      this.error = false
      this.errorMessage = ''
      this.tryingToGetXlsxFromFTP = true
      // Reset the authError if it existed.
      this.authError = null
      return this.getFile({
        storeId: this.storeId,
        username: this.username,
        password: this.password,
      })
        .then((resp) => {
          this.tryingToGetXlsxFromFTP = false
          if (
            typeof resp.response !== 'undefined' &&
            typeof resp.response.status !== 'undefined'
          ) {
            this.error = true
            this.errorMessage = resp.response.statusText
          } else {
            const ab = resp
            const data = new Uint8Array(ab)
            const workbook = XLSX.read(data, { type: 'array' })
            this.setWorkbook(workbook)
            this.$router.push({ name: 'xlsx' })
          }
        })
        .catch((error) => {
          this.tryingToGetXlsxFromFTP = false
          this.error = true
          this.errorMessage = error
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
      <p v-if="error" :class="$style.error">{{ errorMessage }}</p>
      <section>
        <h2>Upload spreadsheet</h2>
        <p>If you have a spreadsheet from the bookstore, upload it here</p>
        <label :class="$style.fileLabel" for="heoaFile">HEOA File</label>
        <input
          id="heoaFile"
          type="file"
          accept="text/plain,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
            v-model="storeId"
            :class="$style.input"
            name="store_id"
            placeholder="storeId"
          />
          <BaseInputText
            v-model="username"
            :class="$style.input"
            name="username"
            placeholder="username"
          />
          <BaseInputText
            v-model="password"
            :class="$style.input"
            name="password"
            type="password"
            placeholder="password"
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
p.error {
  padding: 15px;
  margin: 25px 0;
  color: #fff;
  background-color: #bc5929;
  box-shadow: 0 0 5px #494a44;
}
</style>
