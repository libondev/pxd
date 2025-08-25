<script lang="ts" setup>
import { computed, ref, shallowRef, watch } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { dayjs } from '../../utils/date'
import { throttle } from '../../utils/throttle'
import PInput from '../input/index.vue'
import PPopover from '../popover/index.vue'

interface Props {
  modelValue?: Date | string | number
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
    format: 'HH:mm:ss',
    valueFormat: 'HH:mm:ss',
    closeOnPressEscape: true,
  },
)

const _emits = defineEmits<{
  'change': [visible: boolean]
  'select': [MouseEvent]
  'update:modelValue': [Props['modelValue']]
}>()

const HEIGHT = 32
const VALUE_POSITION_MAP = {
  hours: 0,
  minutes: 1,
  seconds: 2,
} as const

const config = useConfigProvider()

const modelValueList = ref<string[]>([])

const modelValue = computed<string>({
  get() {
    return modelValueList.value.join(':')
  },
  set() {
  },
})

const popoverRef = shallowRef<InstanceType<typeof PPopover>>()

const popoverVisible = shallowRef(false)

function padStringZero(value: number | string): string {
  return String(value).padStart(2, '0')
}

function getFormattedValue(value: Props['modelValue']) {
  let _value = value
  if (_value == null || _value === '') {
    return ''
  }

  if (typeof _value === 'string') {
    const formatDate = dayjs(new Date()).format('YYYY-MM-DD')

    _value = `${formatDate} ${_value}`
  } else {
    _value = new Date(_value)
  }

  return dayjs(_value).format('HH:mm:ss')
}

function closePopover() {
  popoverRef.value?.hide()
}

function onPopoverVisibleChange(visible: boolean = false) {
  popoverVisible.value = visible
}

const onTimeListScroll = throttle((ev: Event) => {
  const target = ev.target as HTMLElement
  const type = target.dataset.type as keyof typeof VALUE_POSITION_MAP
  const value = Math.ceil(target.scrollTop / HEIGHT)
  const index = VALUE_POSITION_MAP[type]

  modelValueList.value[index] = padStringZero(value)
}, 150, { edges: ['leading', 'trailing'] })

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

function onConfirmClick() {
  closePopover()
}

watch(() => props.modelValue, (value) => {
  modelValueList.value = getFormattedValue(value).split(':')
}, { immediate: true })
</script>

<template>
  <PPopover
    ref="popoverRef"
    enterable
    trigger="click"
    scroll-hidden
    :show-delay="0"
    :hide-delay="100"
    :show-transition="false"
    position="bottom-start"
    class="pxd-time-picker w-full"
    :close-on-press-escape="closeOnPressEscape"
    content-class="rounded-xl bg-background-100 shadow-border-menu"
    @visible-change="onPopoverVisibleChange"
  >
    <PInput v-model="modelValue" v-bind="$attrs" :placeholder="placeholder" />

    <template #content>
      <div class="text-sm flex max-w-full transform-gpu tabular-nums outline-none select-none" @click.stop="onContainerClick">
        <div class="p-2 gap-1 flex items-center">
          <ul data-type="hours" class="pxd-time-picker--list w-8 h-40 py-16 relative scrollbar-hidden snap-y snap-mandatory list-none overflow-x-hidden overflow-y-scroll text-center outline-none" @scroll="onTimeListScroll">
            <li v-for="_, i of 24" :key="i" class="h-8 leading-8 cursor-pointer snap-center">
              {{ padStringZero(i) }}
            </li>
          </ul>
          <ul data-type="minutes" class="pxd-time-picker--list w-8 h-40 py-16 relative scrollbar-hidden snap-y snap-mandatory list-none overflow-x-hidden overflow-y-scroll text-center outline-none" @scroll="onTimeListScroll">
            <li v-for="_, i of 60" :key="i" class="h-8 leading-8 cursor-pointer snap-center">
              {{ padStringZero(i) }}
            </li>
          </ul>
          <ul data-type="seconds" class="pxd-time-picker--list w-8 h-40 py-16 relative scrollbar-hidden snap-y snap-mandatory list-none overflow-x-hidden overflow-y-scroll text-center outline-none" @scroll="onTimeListScroll">
            <li v-for="_, i of 60" :key="i" class="h-8 leading-8 cursor-pointer snap-center">
              {{ padStringZero(i) }}
            </li>
          </ul>
        </div>

        <div class="w-24 p-2 h-44 border-l">
          <span>123</span>
        </div>
      </div>

      <div class="p-2 flex items-center justify-end border-t">
        <PButton size="xs" variant="ghost" @click="onConfirmClick">
          {{ config.locale.confirm.ok }}
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
  width: 32px;
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
  left: 44px;
}

.pxd-time-picker--list:nth-child(3)::before {
  left: 80px;
}
</style>
