<script lang="ts" setup>
import { ref } from 'vue'

const log = (msg: string | number) => console.log(msg)


const value = ref('1231212312123121232123')
</script>

<template>
  <CButton plain>default按钮</CButton>
  <CButton plain status="primary">primary按钮</CButton>
  <CButton plain status="warning">warning按钮</CButton>
  <CButton plain status="danger">danger按钮</CButton>

  <CInput v-model="value" />
</template>
