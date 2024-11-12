<script setup lang="ts">
import { useLazyDestroy } from '@/composables/use-lazy-destroy'

interface DialogProps {
  title?: string
  description?: string
  destroyDelay?: number
  destroyOnClose?: boolean
  closeOnClickModal?: boolean
}

defineOptions({
  name: 'PDialog',
  inheritAttrs: false,
})

defineProps<DialogProps>()
const openState = defineModel<boolean>({ default: false })

const dialogRef = useTemplateRef('dialogRef')

function onOpenDialog() {
  document.body.style.overflow = 'hidden'
  dialogRef.value?.showModal()
}

function onCloseDialog() {
  dialogRef.value?.close()
  openState.value = false
  document.body.style.overflow = ''
}

watchEffect(() => {
  if (openState.value) {
    onOpenDialog()
  }
})
</script>

<template>
  <Transition name="transition-slide-down">
    <dialog
      v-if="openState"
      ref="dialogRef"
      class="
        pxd-dialog fixed inset-0 m-auto z-50 w-[540px] rounded-xl shadow-sm outline-0 flex flex-col
        [&::backdrop]:bg-gray-alpha-500 [&::backdrop]:backdrop-blur-sm
      "
      @close="onCloseDialog"
    >
      <div class="flex-1 px-6 pb-6 overflow-y-auto max-h-[min(800px,80vh)]">
        <header class="sticky top-0 left-0 bg-background-100">
          <h3 class="empty:hidden py-6 text-2xl font-semibold tracking-tight">
            {{ title }}
          </h3>
          <p class="empty:hidden text-sm -mt-6 pb-4 text-gray-900">
            {{ description }}
          </p>
        </header>

        <slot />
      </div>

      <footer v-if="$slots.footer" class="flex items-center justify-between border-t border-gray-alpha-400 bg-background-200 p-4">
        <slot name="footer" />
      </footer>
    </dialog>
  </Transition>
</template>
