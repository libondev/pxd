# Resizable
Resizable panel groups

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const direction = ref('row')
</script>

<template>
  <PStack direction="col" gap="2">
    <PSwitchGroup v-model="direction">
      <PSwitch value="row">Row</PSwitch>
      <PSwitch value="col">Col</PSwitch>
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
  <PStack direction="col" gap="2">
    <div class="w-100 h-100 border rounded-lg">
      <PResizable>
        <PResizablePanel class="flex items-center justify-center">
          One
        </PResizablePanel>
        <PResizableHandle />
        <PResizablePanel class="flex items-center justify-center">
          <PResizable direction="col">
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
  <PStack direction="col" gap="2">
    <div class="w-100 h-100 border rounded-lg">
      <PResizable>
        <PResizablePanel :initial-size="50" class="flex items-center justify-center">
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
