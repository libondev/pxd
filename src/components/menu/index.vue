<script lang="ts" setup>
import type { ListOptionSelected } from '../list/types'
import type { MenuEmits, MenuProps } from './types'
import { computed, shallowRef } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { usePopoverResponsive } from '../../composables/use-popover-responsive'
import { getCssUnitValue } from '../../utils/format'
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

const listStyles = computed(() => ({
  '--list-width': getCssUnitValue(props.listWidth),
}))

function togglePopoverVisible(visible: boolean) {
  popoverVisible.value = visible
}

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
  >
    <slot />

    <template #content>
      <PList
        :value="modelValue"
        :style="listStyles"
        :options="options"
        :visible="popoverVisible"
        class="max-h-68 sm:w-(--list-width) rounded-inherit"
        @select="onOptionSelect"
      >
        <template v-if="$slots.item" #item="{ item, index }">
          <slot name="item" :item="item" :index="index" />
        </template>
      </PList>
    </template>
  </PPopover>
</template>
