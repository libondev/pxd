<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'

const value = ref('')
const status = ref(false)
</script>

<template>
  <CProvider>
  <nav>
    <RouterLink tabindex="-1" to="/">Home</RouterLink> |
    <RouterLink tabindex="-1" to="/about">About</RouterLink>
  </nav>

  <CSpace>
    <!-- <CButton>123</CButton>
    <CButton>123</CButton>
    <CButton>123</CButton> -->
    <CSwitch v-model="status" />
    <CCheckbox v-model="value" :value="1">111</CCheckbox>
    <CCheckbox v-model="value" :value="2" />
    <CCheckbox v-model="value" :value="3" />
  </CSpace>
  <!-- <RouterView /> -->
</CProvider>
</template>
