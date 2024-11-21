<script setup lang="ts">
import Preview from '../../components/Preview.vue'

const defaultCode = {
  code: `<PCodeBlock :code="code" filename="test.js" language="vue" />`,
  language: 'vue',
  filename: 'Default.js',
}
</script>

<template>
  <Section title="Code Block" description="Highlight your code block." />

  <Section title="Default">
    <Preview :code="defaultCode.code">
      <PCodeBlock v-bind="defaultCode" />
    </Preview>
  </Section>
</template>
