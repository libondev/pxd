<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('1231212312123121232123')
</script>

<template>
  <CProvider>
    <CButton>default按钮</CButton>
    <CButton status="primary">primary按钮</CButton>
    <CButton status="warning">warning按钮</CButton>
    <CButton status="danger">danger按钮</CButton>

    <CInput v-model="value" />
  </CProvider>
</template>
