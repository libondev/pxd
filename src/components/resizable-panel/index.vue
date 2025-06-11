<script lang="ts" setup>
import { inject, onMounted, ref } from 'vue'

defineOptions({
  name: 'PResizablePanel',
})

const panel = ref<HTMLElement | null>(null)
const size = ref<string>('')

// 获取父组件提供的注册方法
const registerPanel = inject('register-panel', (_: any) => { })

// 暴露方法给父组件用于调整大小
const exposed = {
  setSize(value: string) {
    size.value = value
  },
  getElement() {
    return panel.value
  },
}

defineExpose(exposed)

// 在挂载时向父组件注册自己
onMounted(() => {
  // 确保元素已经准备好
  if (!panel.value) {
    // 等待下一帧再试
    requestAnimationFrame(() => {
      if (panel.value && registerPanel && typeof registerPanel === 'function') {
        registerPanel(exposed)
      }
    })
    return
  }

  if (registerPanel && typeof registerPanel === 'function') {
    registerPanel(exposed)
  }
})
</script>

<template>
  <div
    ref="panel"
    class="pxd-resizable-panel"
    :style="{
      flexBasis: size || '0',
      flexGrow: size ? 0 : 1,
      flexShrink: 0,
      overflow: 'hidden',
    }"
  >
    <slot />
  </div>
</template>

<style lang="postcss">
.pxd-resizable-panel {
  min-width: 0;
  min-height: 0;
  border: 1px solid transparent;
}
</style>
