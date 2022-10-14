<script lang="ts" setup>
import { ref, markRaw, unref, reactive } from 'vue'

const value = ref(123)
const status = ref(true)

// setTimeout(() => {
//   status.value = false
// }, 2000)
</script>

<template>
  <main>
    <CProvider>
      <CButton>open123</CButton>

      <CSwitch v-model="status" />
      <br>
      <br>
      <!-- <CSwitch v-model="status" /> -->
      <!-- <CDialog v-model="status" title="这是一个只有标题的弹窗">
        <template #footer>
          <CButton @click="status = false">Close</CButton>
          <CButton status="primary" @click="status = false">Confirm</CButton>
        </template>
      </CDialog> -->
    </CProvider>
  </main>
</template>

<style>
  /* body {
    background: #000
  } */

  main {
    height: 300vh
  }
</style>
