<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(123)
const state = ref(true)

</script>

<template>
  <CProvider>
    <CButton>default按钮</CButton>
    <CButton status="primary">primary按钮</CButton>
    <CButton status="warning">warning按钮</CButton>
    <CButton status="danger">danger按钮</CButton>

    <CInput v-model="value"></CInput>
  </CProvider>
</template>
