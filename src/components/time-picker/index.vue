<script lang="ts" setup>
import type { DateTimePreset } from '../../types/components/time-picker'
import CalendarIcon from '@gdsicon/vue/calendar'
import { computed, ref, shallowRef, watch } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { dayjs } from '../../utils/date'
import { optimizedOff, optimizedOn, sleep } from '../../utils/event'
import { clampValue } from '../../utils/format'
import PInput from '../input/index.vue'
import PPopover from '../popover/index.vue'

interface Props {
  allowClear?: boolean
  presets?: DateTimePreset[]
  disabled?: boolean
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
    presets: () => [],
  },
)

const emits = defineEmits<{
  'change': [boolean]
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

const scrollTimers: ReturnType<typeof setTimeout>[] = []

function onTimeListScroll(ev: Event) {
  const target = ev.target as HTMLElement
  const value = Math.round(target.scrollTop / HEIGHT)
  const type = target.dataset.type as keyof typeof VALUE_POSITION_MAP
  const index = VALUE_POSITION_MAP[type]
  const clampedValue = clampValue(value, 0, type === 'hours' ? 23 : 59)

  clearTimeout(scrollTimers[index])
  scrollTimers[index] = setTimeout(() => {
    target.scrollTo({
      top: clampedValue * HEIGHT,
      behavior: 'smooth',
    })

    modelValueList.value[index] = padStringZero(clampedValue)
  }, 100)
}

function padStringZero(value: number | string): string {
  return String(value).padStart(2, '0')
}

function showPopover() {
  popoverVisible.value = true
  setTimesScrollTop()
  optimizedOn(document, 'keydown', onKeystrokeClosePopover)
}

function hidePopover() {
  popoverVisible.value = false
  optimizedOff(document, 'keydown', onKeystrokeClosePopover)
}

function parseTimeValue(value: string, max: number) {
  const numberValue = value ? Number.parseInt(value.slice(0, 2)) : 0

  if (!numberValue) {
    return '00'
  }

  return clampValue(numberValue, 0, max).toString()
}

function updateValueList(value: Props['modelValue']) {
  modelValueList.value = getFormattedValue(value).split(':')
}

function getFormattedValue(value: Props['modelValue']) {
  if (value == null || value === '') {
    return ''
  }

  let _value: string | Date
  if (typeof value === 'string') {
    const formatDate = dayjs(new Date()).format('YYYY-MM-DD')

    _value = `${formatDate} ${value}`
  } else if (value instanceof Date) {
    _value = value
  } else {
    _value = new Date(value)
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
  // 先对所有时间进行补全再转换回普通字符串
  updateValueList(modelValueList.value.join(':'))
  modelValue.value = modelValueList.value.join(':')
  hidePopover()
}

function onNowBtnClick(date?: Date) {
  const newValue = getFormattedValue(date ?? new Date())
  modelValue.value = newValue
  modelValueList.value = newValue.split(':')

  hidePopover()
}

function onInputValueChange(value: string) {
  if (!value) {
    modelValue.value = ''
    modelValueList.value = []
    return
  }

  const [h, m, s] = value.split(':')
  const hh = parseTimeValue(h, 23)
  const mm = parseTimeValue(m, 59)
  const ss = parseTimeValue(s, 59)

  modelValue.value = getFormattedValue(`${hh}:${mm}:${ss}`)
  modelValueList.value = [padStringZero(hh), padStringZero(mm), padStringZero(ss)]
}

function onUpdateModelValue(value: string) {
  if (value) {
    return
  }

  modelValue.value = ''
  modelValueList.value = []
}

function onPresetClick(ev: MouseEvent) {
  const target = ev.target as HTMLElement

  if (target.tagName !== 'BUTTON') {
    return
  }

  const index = Number(target.dataset.index)

  if (Number.isNaN(index)) {
    return
  }

  const presetValue = props.presets[index].getDate()

  if (!presetValue) {
    return
  }

  onNowBtnClick(presetValue)
}

function onKeystrokeClosePopover(ev: KeyboardEvent) {
  if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) {
    return
  }

  if (ev.key !== 'Escape' || !props.closeOnPressEscape) {
    return
  }

  hidePopover()
}

watch(() => props.modelValue, updateValueList, { immediate: true })
</script>

<template>
  <PPopover
    enterable
    close-on-scroll
    trigger="manual"
    :show-delay="0"
    :hide-delay="100"
    :disabled="disabled"
    :class="$attrs.class"
    :style="$attrs.style"
    :visible="popoverVisible"
    class="pxd-time-picker w-full"
    disabled-show-transition
    @trigger-click="showPopover"
    @outside-click="onConfirmClick"
  >
    <PInput
      ref="inputRef"
      :disabled="disabled"
      :allow-clear="allowClear"
      :model-value="modelValue"
      :placeholder="placeholder"
      :prefix-style="false"
      v-bind="$attrs"
      @blur="hidePopover"
      @focus="showPopover"
      @change="onInputValueChange"
      @update:model-value="onUpdateModelValue"
    >
      <template v-if="prefixIcon" #prefix>
        <CalendarIcon class="ml-3 pointer-events-none" />
      </template>
    </PInput>

    <template #content>
      <div class="rounded-xl bg-background-100 shadow-border-menu">
        <div class="text-sm flex max-w-full transform-gpu tabular-nums outline-none select-none" @click.stop="onTimesContainerClick">
          <div class="p-2 gap-1 relative flex items-center">
            <div class="pxd-time-picker--list relative">
              <ul ref="timeHoursRef" data-type="hours" class="w-8 h-40 px-0 m-0 py-16 scrollbar-hidden list-none overflow-x-hidden overflow-y-scroll overscroll-contain text-center outline-none" @scroll.stop="onTimeListScroll">
                <li v-for="_, i of 24" :key="i" class="h-8 leading-8 cursor-pointer">
                  {{ padStringZero(i) }}
                </li>
              </ul>
            </div>
            <div class="pxd-time-picker--list relative">
              <ul ref="timeMinutesRef" data-type="minutes" class="w-8 h-40 px-0 m-0 py-16 scrollbar-hidden list-none overflow-x-hidden overflow-y-scroll overscroll-contain text-center outline-none" @scroll.stop="onTimeListScroll">
                <li v-for="_, i of 60" :key="i" class="h-8 leading-8 cursor-pointer">
                  {{ padStringZero(i) }}
                </li>
              </ul>
            </div>
            <div class="pxd-time-picker--list relative">
              <ul ref="timeSecondsRef" data-type="seconds" class="w-8 h-40 px-0 m-0 py-16 scrollbar-hidden list-none overflow-x-hidden overflow-y-scroll overscroll-contain text-center outline-none" @scroll.stop="onTimeListScroll">
                <li v-for="_, i of 60" :key="i" class="h-8 leading-8 cursor-pointer">
                  {{ padStringZero(i) }}
                </li>
              </ul>
            </div>
          </div>

          <div v-if="presets?.length" class="w-26 p-2 h-44 gap-1 scrollbar-hidden flex flex-wrap content-start overflow-auto border-l outline-none" @click="onPresetClick">
            <button
              v-for="preset, i in presets"
              :key="preset.label"
              :data-index="i"
              class="h-5 px-1.5 cursor-pointer appearance-none rounded-sm bg-gray-300 text-13px whitespace-nowrap text-foreground self-focus-ring outline-none motion-safe:transition-all"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <div class="p-2 gap-1 flex items-center justify-between border-t" @click.stop>
          <PButton size="xs" variant="ghost" class="!px-0 text-13px" @click="onNowBtnClick()">
            {{ config.locale.date.now }}
          </PButton>

          <PButton size="xs" variant="ghost" class="!px-0 text-13px" @click="onCancelClick">
            {{ config.locale.confirm.cancel }}
          </PButton>
        </div>
      </div>
    </template>
  </PPopover>
</template>

<style>
.pxd-time-picker--list ul {
  -webkit-overflow-scrolling: auto;
}

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
