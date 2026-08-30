<script lang="ts" setup>
import type { ListOptionSelected } from '../list/types'
import type { MenuEmits, MenuProps } from './types'
import { nextTick, shallowRef, watch } from 'vue'
import { useListKeyboardController } from '../../composables/_internal/use-list-keyboard-controller.js'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { usePopoverResponsive } from '../../composables/_internal/use-popover-responsive.js'
import PList from '../list/index.vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PMenu',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<MenuProps>(), {
  options: () => [],
  position: 'bottom-start',
  closeOnPressEscape: true,
})

const emits = defineEmits<MenuEmits>()
const modelValue = useModelValue(props, emits)
const { isAdaptive, responsiveClasses } = usePopoverResponsive()

const popoverVisible = shallowRef(false)
const listRef = shallowRef<InstanceType<typeof PList>>()

const { onKeydown } = useListKeyboardController({
  enabled: () => popoverVisible.value,
  onCommand: (command) => listRef.value?.dispatch(command) ?? false,
  keymap: {
    ArrowDown: 'next',
    ArrowLeft: 'leave-parent',
    ArrowRight: 'enter-child',
    ArrowUp: 'previous',
    End: 'last',
    Enter: 'activate',
    Home: 'first',
    ' ': 'activate',
  },
})

function togglePopoverVisible(visible: boolean) {
  popoverVisible.value = visible
}

watch(popoverVisible, async (visible) => {
  if (!visible) {
    return
  }

  await nextTick()
  listRef.value?.focus()
})

function onOptionSelect(item: ListOptionSelected, ev: MouseEvent) {
  emits('select', item, ev)
  modelValue.value = item.value
  togglePopoverVisible(false)
}
</script>

<template>
  <PPopover
    v-model="popoverVisible"
    class="pxd-menu"
    trigger="click"
    :disabled="disabled"
    :position="position"
    :adaptive="isAdaptive"
    :wrapper-class="responsiveClasses.wrapper"
    :content-class="responsiveClasses.content"
    :lock-scroll-on-visible="isAdaptive"
    :close-on-press-escape="closeOnPressEscape"
    v-bind="$attrs"
    @wrapper-keydown="onKeydown"
  >
    <slot />

    <template #content>
      <PList
        ref="listRef"
        :value="modelValue"
        :options="options"
        :visible="popoverVisible"
        class="max-h-68 rounded-inherit"
        @select="onOptionSelect"
      >
        <template v-if="$slots.item" #item="{ item, index }">
          <slot name="item" :item="item" :index="index" />
        </template>
      </PList>
    </template>
  </PPopover>
</template>
