# Intersection Observer

Render only when components are visible in the viewport.

> Inspiration comes from<PLinkButton variant="link" target="_blank" text="isaact/vue-infinity" href="https://github.com/isaact/vue-infinity" external-icon />

## Default

The component supports the `root/root-margin/threshold` attribute, which will be passed directly to IntersectionObserver.

```vue demo
<script setup>
import { shallowRef } from 'vue'

const isVisible = shallowRef(true)

function onVisibleChange(visible) {
  isVisible.value = visible
}

function onBeforeShow() {
  console.log('onBeforeShow')
}

function onShow() {
  console.log('onShow')
}

function onBeforeHide() {
  console.log('onBeforeHide')
}

function onHide() {
  console.log('onHide')
}
</script>

<template>
  <div>
    <span>Content is </span>
    <span class="font-semibold underline" :class="isVisible ? 'text-blue-900' : 'text-red-900'">
      {{ isVisible ? 'visible' : 'hidden' }}
    </span>
  </div>

  <div class="w-100 max-w-full h-80 overflow-auto mt-2 border border-dashed rounded-lg">
    <PIntersectionObserver
      class="size-40 max-w-full rounded-md border border-dashed my-100 mx-auto flex items-center justify-center bg-background-200"
      @visible-change="onVisibleChange"
      @before-show="onBeforeShow"
      @show="onShow"
      @before-hide="onBeforeHide"
      @hide="onHide"
    >
      Hello, world!
    </PIntersectionObserver>
  </div>
</template>
```

## Estimated size

Setting an estimated size can prevent large layout deviation after rendering. (After the first rendering, it will be replaced with the real size.)

```vue demo=Static.vue
<template>
  <div class="h-16 flex items-center justify-center rounded-md border border-dashed bg-background-200">
    This is a static component.
  </div>
</template>
```

```vue demo
<script setup>
import { shallowRef, defineAsyncComponent } from 'vue'

// Because the component will not be rendered initially,
// the corresponding resource file will only be loaded when it is visible.
// (You can see when the resource is loaded in the console network panel.)
const LazyLoadedComponent = defineAsyncComponent(() => import('doc:Static.vue'))

const isVisible = shallowRef(false)

function onVisibleChange(visible) {
  isVisible.value = visible
}
</script>

<template>
  <div>
    <span>Content is </span>
    <span class="font-semibold underline" :class="isVisible ? 'text-blue-900' : 'text-red-900'">
      {{ isVisible ? 'visible' : 'hidden' }}
    </span>
  </div>

  <div class="w-100 max-w-full h-60 overflow-auto mt-2 border border-dashed rounded-lg">
    <PIntersectionObserver
      class="mt-80 max-w-full"
      width="100%"
      height="64px"
      @visible-change="onVisibleChange"
    >
      <LazyLoadedComponent />
    </PIntersectionObserver>
  </div>
</template>
```

## KeepAlive

When your component switching costs a lot, you can enable `keep-alive` to cache components.

```vue demo=Counter.vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <PButton variant="primary" @click="increment"> Count is: {{ count }} </PButton>
</template>
```

```vue demo
<script setup>
import Counter from 'doc:Counter.vue'
</script>

<template>
  <div class="w-100 max-w-full h-60 overflow-auto">
    <div class="my-80 flex flex-col gap-2">
      <PIntersectionObserver height="36px">
        <PStack align="center">
          <Counter />
          <span>Without keep-alive</span>
        </PStack>
      </PIntersectionObserver>

      <PIntersectionObserver height="36px" keep-alive>
        <PStack align="center">
          <Counter />
          <span>With keep-alive</span>
        </PStack>
      </PIntersectionObserver>
    </div>
  </div>
</template>
```
