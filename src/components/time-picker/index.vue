<script lang="ts" setup>
import { shallowRef } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import PButton from '../button/index.vue'
import PInput from '../input/index.vue'
import PPopover from '../popover/index.vue'

interface Props {
  format?: string
  modelValue?: string
  valueFormat?: string
  placeholder?: string
  closeOnPressEscape?: boolean
}

defineOptions({
  name: 'PTimePicker',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    modelValue: '',
    closeOnPressEscape: true,
  },
)

const emits = defineEmits<{
  'change': [visible: boolean]
  'select': [MouseEvent]
  'update:modelValue': [Props['modelValue']]
}>()

const modelValue = useModelValue(props, emits)
const popoverRef = shallowRef<InstanceType<typeof PPopover>>()

const popoverVisible = shallowRef(false)

function padStringZero(value: number | string): string {
  return String(value).padStart(2, '0')
}

function closePopover() {
  popoverRef.value?.hide()
}

function onPopoverVisibleChange(visible: boolean = false) {
  popoverVisible.value = visible
}

function onContainerClick(ev: MouseEvent) {
  const target = ev.target as HTMLElement

  if (target.tagName !== 'LI') {
    return
  }

  const scrollContainer = target.parentNode as HTMLElement
  if (!scrollContainer) {
    return
  }

  // Calculate the scroll position to center the target within its scroll container
  const containerRect = scrollContainer.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()

  const containerCenter = containerRect.height / 2
  const targetCenter = targetRect.height / 2
  const targetOffsetFromTop = targetRect.top - containerRect.top + scrollContainer.scrollTop

  const newScrollTop = targetOffsetFromTop - containerCenter + targetCenter

  scrollContainer.scrollTo({
    top: newScrollTop,
    behavior: 'smooth',
  })
}
</script>

<template>
  <PPopover
    ref="popoverRef"
    enterable
    trigger="click"
    class="pxd-time-picker"
    scroll-hidden
    :show-delay="0"
    :hide-delay="100"
    :show-transition="false"
    :close-on-press-escape="closeOnPressEscape"
    content-class="rounded-xl bg-background-100 shadow-border-menu"
    @visible-change="onPopoverVisibleChange"
  >
    <PInput v-model="modelValue" :placeholder="placeholder" />

    <template #content>
      <div class="p-2 gap-1 text-sm flex w-full max-w-full transform-gpu tabular-nums outline-none select-none" @click.stop="onContainerClick">
        <ul data-type="hours" class="pxd-time-picker--list w-12 h-40 py-16 relative scrollbar-hidden snap-y snap-mandatory list-none overflow-x-hidden overflow-y-scroll text-center outline-none">
          <li v-for="_, i of 24" :key="i" class="h-8 leading-8 cursor-pointer snap-center">
            {{ padStringZero(i) }}
          </li>
        </ul>
        <ul data-type="minutes" class="pxd-time-picker--list w-12 h-40 py-16 relative scrollbar-hidden snap-y snap-mandatory list-none overflow-x-hidden overflow-y-scroll text-center outline-none">
          <li v-for="_, i of 60" :key="i" class="h-8 leading-8 cursor-pointer snap-center">
            {{ padStringZero(i) }}
          </li>
        </ul>
        <ul data-type="seconds" class="pxd-time-picker--list w-12 h-40 py-16 relative scrollbar-hidden snap-y snap-mandatory list-none overflow-x-hidden overflow-y-scroll text-center outline-none">
          <li v-for="_, i of 60" :key="i" class="h-8 leading-8 cursor-pointer snap-center">
            {{ padStringZero(i) }}
          </li>
        </ul>
      </div>

      <div class="p-2 flex items-center justify-end border-t">
        <PButton size="xs" variant="ghost" @click="closePopover">
          OK
        </PButton>
      </div>
    </template>
  </PPopover>
</template>

<style>
.pxd-time-picker--list::before {
  content: '';
  position: fixed;
  top: 72px;
  width: 48px;
  height: 32px;
  z-index: -1;
  border-radius: var(--radius-md);
  background: var(--color-gray-alpha-200);
  pointer-events: none;
}

.pxd-time-picker--list:nth-child(1)::before {
  left: 8px;
}

.pxd-time-picker--list:nth-child(2)::before {
  left: 60px;
}

.pxd-time-picker--list:nth-child(3)::before {
  left: 112px;
}
</style>
