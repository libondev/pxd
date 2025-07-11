<!--
  Because there can only be one root node in Vue2, slot cannot be directly used as the root node.
  So we need to wrap the slot with a div. (Vue3 is not affected by this limitation.)
-->
<template>
  <div class="pxd-intersection-observer--keep-alive-content">
    <slot />
  </div>
</template>
