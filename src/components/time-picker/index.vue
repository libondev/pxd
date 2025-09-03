<script lang="ts" setup>
import CalendarIcon from '@gdsicon/vue/calendar'
import { computed, ref, shallowRef, watch } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { dayjs } from '../../utils/date'
import { sleep } from '../../utils/event'
import { clampValue } from '../../utils/format'
import { throttle } from '../../utils/throttle'
import PInput from '../input/index.vue'
import PPopover from '../popover/index.vue'

interface Props {
  presets?: []
  modelValue?: Date | string | number
  prefixIcon?: boolean
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
    prefixIcon: true,
    closeOnPressEscape: true,
  },
)

const emits = defineEmits<{
  'change': [visible: boolean]
  'select': [MouseEvent]
  'update:modelValue': [string]
}>()

const HEIGHT = 32
const VALUE_POSITION_MAP = {
  hours: 0,
  minutes: 1,
  seconds: 2,
} as const

const config = useConfigProvider()
const inputRef = shallowRef<InstanceType<typeof PInput>>()
const timeHoursRef = shallowRef<HTMLElement>()
const timeMinutesRef = shallowRef<HTMLElement>()
const timeSecondsRef = shallowRef<HTMLElement>()

const popoverVisible = shallowRef(false)

const modelValueList = ref<string[]>([])

const modelValue = computed<string>({
  get() {
    return modelValueList.value.join(':')
  },
  set(value: string) {
    emits('update:modelValue', value)
  },
})

const onTimeListScroll = throttle((ev: Event) => {
  const target = ev.target as HTMLElement
  const type = target.dataset.type as keyof typeof VALUE_POSITION_MAP
  const value = Math.ceil(target.scrollTop / HEIGHT)
  const index = VALUE_POSITION_MAP[type]

  modelValueList.value[index] = padStringZero(value)
}, 150, { edges: ['leading', 'trailing'] })

function padStringZero(value: number | string): string {
  return String(value).padStart(2, '0')
}

function showPopover() {
  popoverVisible.value = true
  setTimesScrollTop()
  inputRef.value?.blur()
}

function hidePopover() {
  popoverVisible.value = false
}

function parseTimeValue(value: string, max: number) {
  const numberValue = value ? Number.parseInt(value.slice(0, 2)) : 0

  if (!numberValue) {
    return '00'
  }

  return padStringZero(clampValue(numberValue, 0, max).toString())
}

function updateValueList(value: Props['modelValue']) {
  modelValueList.value = getFormattedValue(value).split(':')
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

async function setTimesScrollTop() {
  // Ensure that the asynchronous rendering is completed(In fact, 5ms is sufficient in most cases)
  await sleep(10)

  const elList = [timeHoursRef.value, timeMinutesRef.value, timeSecondsRef.value]

  elList.forEach((el, i) => {
    const scrollTop = Number(modelValueList.value[i] || 0) * HEIGHT

    el?.scrollTo({ top: scrollTop })
  })
}

function onTimesContainerClick(ev: MouseEvent) {
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
    top: Math.max(0, newScrollTop),
    behavior: 'smooth',
  })
}

function onCancelClick() {
  updateValueList(props.modelValue)
  hidePopover()
}

function onConfirmClick() {
  modelValue.value = modelValueList.value.join(':')
  hidePopover()
}

function onNowBtnClick() {
  const now = new Date()
  modelValueList.value = [
    padStringZero(now.getHours()),
    padStringZero(now.getMinutes()),
    padStringZero(now.getSeconds()),
  ]

  onConfirmClick()
}

function onInputValueChange(value: string) {
  const [h, m, s] = value.split(':')

  modelValueList.value = [parseTimeValue(h, 23), parseTimeValue(m, 59), parseTimeValue(s, 59)]
}

watch(() => props.modelValue, updateValueList, { immediate: true })
</script>

<template>
  <PPopover
    enterable
    scroll-hidden
    trigger="manual"
    :show-delay="0"
    :hide-delay="100"
    disabled-show-transition
    :visible="popoverVisible"
    :close-on-press-escape="closeOnPressEscape"
    class="pxd-time-picker"
    trigger-class="w-full"
    v-bind="$attrs"
    @trigger-click="showPopover"
    @outside-click="onConfirmClick"
  >
    <PInput
      ref="inputRef"
      :model-value="modelValue"
      :placeholder="placeholder"
      :prefix-style="false"
      @change="onInputValueChange"
    >
      <template v-if="prefixIcon" #prefix>
        <CalendarIcon class="ml-3" />
      </template>
    </PInput>

    <template #content>
      <div class="rounded-xl bg-background-100 shadow-border-menu">
        <div class="text-sm flex max-w-full transform-gpu tabular-nums outline-none select-none" @click.stop="onTimesContainerClick">
          <div class="p-2 gap-1 relative flex items-center">
            <div class="pxd-time-picker--list relative">
              <ul ref="timeHoursRef" data-type="hours" class="w-8 h-40 py-16 scrollbar-hidden snap-y snap-mandatory list-none overflow-x-hidden overflow-y-scroll overscroll-contain text-center outline-none" @scroll.stop="onTimeListScroll">
                <li v-for="_, i of 24" :key="i" class="h-8 leading-8 cursor-pointer snap-center">
                  {{ padStringZero(i) }}
                </li>
              </ul>
            </div>
            <div class="pxd-time-picker--list relative">
              <ul ref="timeMinutesRef" data-type="minutes" class="w-8 h-40 py-16 scrollbar-hidden snap-y snap-mandatory list-none overflow-x-hidden overflow-y-scroll overscroll-contain text-center outline-none" @scroll.stop="onTimeListScroll">
                <li v-for="_, i of 60" :key="i" class="h-8 leading-8 cursor-pointer snap-center">
                  {{ padStringZero(i) }}
                </li>
              </ul>
            </div>
            <div class="pxd-time-picker--list relative">
              <ul ref="timeSecondsRef" data-type="seconds" class="w-8 h-40 py-16 scrollbar-hidden snap-y snap-mandatory list-none overflow-x-hidden overflow-y-scroll overscroll-contain text-center outline-none" @scroll.stop="onTimeListScroll">
                <li v-for="_, i of 60" :key="i" class="h-8 leading-8 cursor-pointer snap-center">
                  {{ padStringZero(i) }}
                </li>
              </ul>
            </div>
          </div>

          <ul v-if="presets?.length" class="w-24 p-2 h-44 gap-2 p-0 m-0 flex list-none flex-wrap border-l outline-none">
            <li>123</li>
          </ul>
        </div>

        <div class="p-2 gap-1 flex items-center justify-between border-t" @click.stop>
          <PButton size="xs" variant="ghost" class="!px-0 text-xs" @click="onNowBtnClick">
            {{ config.locale.date.now }}
          </PButton>

          <PButton size="xs" variant="ghost" class="!px-0 text-xs" @click="onCancelClick">
            {{ config.locale.confirm.cancel }}
          </PButton>
        </div>
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
