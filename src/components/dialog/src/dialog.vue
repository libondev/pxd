<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  AlertDialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'radix-vue'

defineOptions({
  name: 'PxDialog',
  install(this: Component, app: App) {
    app.component(this.name, this)
  }
})

defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },

  /**
   * Click on the modal to close the dialog.
   */
  closeOnClickModal: {
    type: Boolean,
    default: false
  }
})

const openState = defineModel<boolean>()
</script>

<template>
  <DialogRoot v-model:open="openState">
    <DialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>

    <DialogPortal to="body">
      <DialogOverlay class="fixed inset-0 z-10 bg-background/90 animated animated-duration-150 data-[state=open]:animated-fade-in data-[state=closed]:animated-fade-out" />
      <component
        :is="closeOnClickModal ? DialogContent : AlertDialogContent"
        class="pxd-dialog fixed left-0 right-0 top-50% translate-y--50% mx-auto z-11 grid gap-4 w-full box-border max-w-lg bg-background rounded-lg p-8 shadow-lg b-(1 solid border) origin-center animated animated-duration-150 data-[state=open]:animated-zoom-in data-[state=closed]:animated-zoom-out"
      >
        <div class="pxd-dialog--header">
          <DialogTitle class="text-lg font-500 tracking-tight m-0">
            <slot name="title">
              {{ title }}
            </slot>
          </DialogTitle>

          <DialogDescription v-if="description" class="text-muted-foreground m-0 text-sm leading-normal">
            <slot name="description">
              {{ description }}
            </slot>
          </DialogDescription>

          <DialogClose
            class="absolute right-4 top-4 z-11 b-0 outline-none p-1 rounded text-4 bg-transparent op-50 hover:(bg-secondary op-100) cursor-pointer text-inherit"
            aria-label="Close"
          >
            <i class="block pointer-events-none i-ic-close" />
          </DialogClose>
        </div>

        <slot />
      </component>
    </DialogPortal>
  </DialogRoot>
</template>
