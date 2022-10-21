<template>
  <Teleport
    to="body"
    :disabled="!props.appendToBody"
  >
    <Transition
      name="carbons-fade"
      v-bind="maskTransitionMethods"
    >
      <div
        v-show="modelValue"
        :class="className"
        :style="{ zIndex }"
      >
        <Transition
          name="carbons-zoom"
          v-bind="modalTransitionMethods"
        >
          <div
            v-show="modelVisible"
            ref="dialogRef"
            tabindex="0"
            role="dialog"
            :aria-labelledby="title"
            :aria-describedby="description"
            class="c-dialog--inner carbons-relative carbons-flex-col"
          >
            <div class="c-dialog--header">
              <span
                v-if="$slots.title ?? title"
                class="c-dialog--text"
              >
                <slot name="title">{{ title }}</slot>
              </span>
              <p
                v-if="$slots.description ?? description"
                class="c-dialog--description"
              >
                <slot name="description">
                  {{ description }}
                </slot>
              </p>
              <button
                v-if="showClose"
                class="c-dialog--close carbons-absolute carbons-transition"
                @click="close"
              />
            </div>

            <div
              v-if="$slots.default"
              class="c-dialog--content"
            >
              <slot />
            </div>
            <div
              v-if="$slots.footer"
              class="c-dialog--footer"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup name="CDialog">
import { dialogProps } from './constraints'
import { createWatchers, getFilledClassNames } from '../../_utils'
import { useFocusTrap, useZIndex } from '../../_hooks'

import { onClickOutside } from '@vueuse/core'

const props = defineProps(dialogProps)
const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'before-open'): void
  (e: 'before-close'): void
}>()

const dialogRef = ref()
const zIndex = useZIndex()
const className = computed(() => {
  return ['c-dialog', getFilledClassNames('fixed flex-col items-center justify-center')]
})

const modelVisible = ref(props.modelValue)

const close = (): void => {
  emits('update:modelValue', false)
}

const { activate, deactivate } = useFocusTrap(dialogRef)
const visibleWatchers = createWatchers(() => props.modelValue, {
  initialValue: [(value) => value ? activate() : deactivate()]
})

// lock body scroll
if (props.lockScroll) {
  visibleWatchers.add((value) => {
    if (value) {
      document.body.classList.add('carbons-overflow-hidden')
      return
    }

    setTimeout(() => {
      document.body.classList.remove('carbons-overflow-hidden')
    }, 200)
  })
}

// click outside close dialog
if (props.closeOnClickOutside) {
  let cleanFn: ReturnType<typeof onClickOutside> | null
  visibleWatchers.add((value) => {
    if (!value) {
      cleanFn?.()
      cleanFn = null
      return
    }

    cleanFn = onClickOutside(dialogRef, close)
  })
}

// press escape close dialog
if (props.closeOnPressEscape) {
  const listener = (e: KeyboardEvent): void => {
    if (e.key !== 'Escape') return

    close()
  }

  visibleWatchers.add((value) => {
    if (value) {
      document.addEventListener('keydown', listener)
    } else {
      document.removeEventListener('keydown', listener)
    }
  })
}

const maskTransitionMethods = {
  onBeforeEnter () {
    emits('before-open')
  },
  onBeforeLeave () {
    emits('before-close')
  },
  onEnter () {
    modelVisible.value = true
  },
  onLeave () {
    modelVisible.value = false
  }
}

const modalTransitionMethods = {
  onAfterEnter () {
    emits('open')
  },
  onAfterLeave () {
    emits('close')
  }
}
</script>
