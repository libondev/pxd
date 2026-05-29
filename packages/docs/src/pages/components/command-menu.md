# Command Menu

Launch a set of actions as a full-screen overlay.

## Default

```vue demo
<script setup>
import { ref } from "vue";

const showCommandMenu = ref(false);
</script>

<template>
  <PButton variant="primary" @click="showCommandMenu = true"> Open Command Menu </PButton>

  <PCommandMenu v-model="showCommandMenu" placeholder="What do you need?">
    <PCommandMenuGroup label="Suggestions">
      <PListItem label="Figma Import" />
    </PCommandMenuGroup>

    <PCommandMenuGroup label="Commands">
      <PListItem label="Import Extension" />
      <PListItem label="Manage Extensions" />
    </PCommandMenuGroup>

    <PCommandMenuGroup label="Collaboration">
      <PListItem label="Flags Explorer" />
      <!-- When using slot to customize rendering, it is still recommended to pass in label/description or keywords attribute for content search. -->
      <PListItem label="File Explorer">
        <span>File Explorer</span>
      </PListItem>

      <!-- use keywords prop -->
      <PListItem :keywords="['image', 'explorer', 'viewer', 'file', 'assets']">
        <span>Image Explorer</span>
      </PListItem>
    </PCommandMenuGroup>
  </PCommandMenu>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| width | `string \| number` | - | - |
| model-value | `boolean` | `false` | - |
| placeholder | `string` | `` | - |
| close-on-select-item | `boolean` | `true` | - |
| close-on-press-escape | `boolean` | `true` | - |
| close-on-click-overlay | `boolean` | `true` | - |

## CommandMenuGroup Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string \| number \| null` | - | - |
