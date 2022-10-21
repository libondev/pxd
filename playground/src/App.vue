<script setup lang="ts" name="CApp">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'

const value = ref('')
const status = ref(false)
</script>

<template>
  <PxSpace>
    <PxButton>123</PxButton>
    <PxRadio>123</PxRadio>
    <PxCheckbox>123</PxCheckbox>
    <PxIcon></PxIcon>
    <PxSpinner>123</PxSpinner>
    <PxSwitch v-model="status" />
  </PxSpace>
  <!-- <nav>
    <RouterLink tabindex="-1" to="/">Home</RouterLink> |
    <RouterLink tabindex="-1" to="/about">About</RouterLink>
  </nav> -->
</template>
