<script lang="ts" setup>
const log = (msg: string | number) => console.log(msg)

</script>

<template>
  <CButton>default按钮</CButton>
  <CButton status="success">success按钮</CButton>
  <CButton status="warning">warning按钮</CButton>
  <CButton status="danger">danger按钮</CButton>
</template>
