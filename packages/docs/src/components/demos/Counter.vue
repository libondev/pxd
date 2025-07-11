<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <PButton variant="primary" @click="increment">
    Count is: {{ count }}
  </PButton>
</template>
