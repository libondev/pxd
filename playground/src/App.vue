<script setup lang="ts" name="CApp">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'

const value = ref('')
const status = ref(false)
</script>

<template>
  <CBreadcrumb />
  <CSpace>
    <button>1</button>
    <button>1</button>
    <button>1</button>
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
