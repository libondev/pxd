<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(123)
const status = ref(true)

// setTimeout(() => {
//   status.value = false
// }, 2000)
</script>

<template>
  <main>
    <CProvider>
      <CButton plain @click="status = true">open</CButton>
      <CDialog v-model="status" title="这是一个只有标题的弹窗">
        <!-- <div style="height: 1000px">1231</div> -->

        <template #footer>
          <CButton @click="status = false">Close</CButton>
          <CButton status="primary" @click="status = false">Confirm</CButton>
        </template>
      </CDialog>
    </CProvider>
  </main>
</template>

<style>
  body {
    background: #000
  }

  main {
    height: 300vh
  }
</style>
