<script setup lang="ts" name="CApp">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'

const value = ref('')
const status = ref(false)
</script>

<template>
  <!-- <CBreadcrumb /> -->
  <CSpace>
    <CButton>123</CButton>
    <CRadio>123</CRadio>
    <CCheckbox>123</CCheckbox>
    <CIcon></CIcon>
    <CSpinner>123</CSpinner>
    <CSwitch v-model="status" />
  </CSpace>
  <!-- <nav>
    <RouterLink tabindex="-1" to="/">Home</RouterLink> |
    <RouterLink tabindex="-1" to="/about">About</RouterLink>
  </nav> -->

  <!-- <CSpace>
    <CSwitch v-model="status" />
    <CCheckbox v-model="value" :value="1">111</CCheckbox>
    <CCheckbox v-model="value" :value="2" />
    <CCheckbox v-model="value" :value="3" />
  </CSpace> -->
</template>
