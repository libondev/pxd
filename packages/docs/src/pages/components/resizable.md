# Resizable
Resizable panel groups

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const direction = ref('horizontal')
</script>

<template>
  <PStack direction="vertical">
    <PSwitchGroup v-model="direction">
      <PSwitch value="horizontal">Row</PSwitch>
      <PSwitch value="vertical">Col</PSwitch>
    </PSwitchGroup>

    <div class="w-100 h-100 border rounded-lg">
      <PResizable :direction="direction">
        <PResizablePanel class="flex items-center justify-center">
          One
        </PResizablePanel>
        <PResizableHandle />
        <PResizablePanel class="flex items-center justify-center">
          Two
        </PResizablePanel>
      </PResizable>
    </div>
  </PStack>
</template>
```

## Nested

```vue demo
<template>
  <PStack direction="vertical" gap="2">
    <div class="w-100 h-100 border rounded-lg">
      <PResizable>
        <PResizablePanel class="flex items-center justify-center">
          One
        </PResizablePanel>
        <PResizableHandle />
        <PResizablePanel class="flex items-center justify-center">
          <PResizable direction="vertical">
            <PResizablePanel class="flex items-center justify-center">
              One
            </PResizablePanel>
            <PResizableHandle />
            <PResizablePanel class="flex items-center justify-center">
              Two
            </PResizablePanel>
          </PResizable>
        </PResizablePanel>
      </PResizable>
    </div>
  </PStack>
</template>
```

## Sizes

```vue demo
<template>
  <PStack direction="vertical" gap="2">
    <div class="w-100 h-100 border rounded-lg">
      <PResizable>
        <PResizablePanel :size="50" class="flex items-center justify-center">
          One
        </PResizablePanel>
        <PResizableHandle />
        <PResizablePanel :min-size="50" class="flex items-center justify-center">
          Two
        </PResizablePanel>
      </PResizable>
    </div>
  </PStack>
</template>
```
