<script lang="ts" setup>
import type { DateTimePreset } from '../../types/components/time-picker'
import type { ComponentSize } from '../../types/shared/props'
import CalendarIcon from '@gdsicon/vue/calendar'
import { computed, shallowRef, watch } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { dayjs } from '../../utils/date'
import { clampValue } from '../../utils/format'
import PInput from '../input/index.vue'
import PPopover from '../popover/index.vue'

interface Props {
  size?: ComponentSize
  error?: boolean | string
  allowClear?: boolean
  presets?: DateTimePreset[]
  disabled?: boolean
  modelValue?: Date | string | number
  prefixIcon?: boolean
  placeholder?: string
  closeOnPressEscape?: boolean
  format?: string
  valueFormat?: string
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
    format: 'HH:mm:ss',
    valueFormat: 'HH:mm:ss',
  },
)

const emits = defineEmits<{
  'change': [boolean]
  'select': [MouseEvent]
  'update:modelValue': [string]
}>()

const HEIGHT = 32
const VALUE_POSITION_MAP = {
  hour: 0,
  minute: 1,
  second: 2,
} as const

const config = useConfigProvider()

const timeHoursRef = shallowRef<HTMLElement>()
const timeMinutesRef = shallowRef<HTMLElement>()
const timeSecondsRef = shallowRef<HTMLElement>()

const popoverVisible = shallowRef(false)

const dayjsDateTime = shallowRef<dayjs.Dayjs | null>(null)

const modelValue = computed<string>({
  get() {
    return dayjsDateTime.value ? dayjsDateTime.value.format(props.format) : ''
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
  const clampedValue = clampValue(value, 0, type === 'hour' ? 23 : 59)

  clearTimeout(scrollTimers[index])
  scrollTimers[index] = setTimeout(() => {
    target.scrollTo({
      top: clampedValue * HEIGHT,
      behavior: 'smooth',
    })

    dayjsDateTime.value = dayjsDateTime.value ? dayjsDateTime.value.set(type, clampedValue) : null
  }, 100)
}

function padStringZero(value: number | string): string {
  return String(value).padStart(2, '0')
}

function onVisibleChange(visible: boolean) {
  popoverVisible.value = visible
}

function hidePopover() {
  onVisibleChange(false)
}

function updateValueList(value: Props['modelValue']) {
  dayjsDateTime.value = getFormattedValue(value)
}

function getFormattedValue(value: Props['modelValue']) {
  if (value == null || value === '') {
    return dayjs()
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

  return dayjs(_value)
}

async function setTimesScrollTop() {
  if (!dayjsDateTime.value) {
    return
  }

  const elList = [timeHoursRef.value, timeMinutesRef.value, timeSecondsRef.value]
  const modelValueList = [dayjsDateTime.value.hour(), dayjsDateTime.value.minute(), dayjsDateTime.value.second()]

  elList.forEach((el, i) => {
    const scrollTop = modelValueList[i]! * HEIGHT

    el?.scrollTo({ top: scrollTop })
  })
}

function onTimeListClick(ev: MouseEvent) {
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
  modelValue.value = dayjsDateTime.value ? dayjsDateTime.value.format(props.valueFormat) : ''
}

function onPresetTimeClick(date?: Date) {
  onInputValueChange(date ?? new Date())

  hidePopover()
}

function onInputValueChange(value: string | Date) {
  if (!value) {
    modelValue.value = ''
    dayjsDateTime.value = null
    return
  }

  dayjsDateTime.value = getFormattedValue(value)
  onConfirmClick()
}

function onUpdateModelValue(value: string) {
  if (value) {
    return
  }

  modelValue.value = ''
  dayjsDateTime.value = null
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

  const presetValue = props.presets[index]!.getDate()

  if (!presetValue) {
    return
  }

  onPresetTimeClick(presetValue)
}

watch(() => props.modelValue, updateValueList, { immediate: true })
</script>

<template>
  <PPopover
    enterable
    trigger="click"
    :show-delay="0"
    :hide-delay="0"
    :disabled="disabled"
    :class="$attrs.class"
    :style="$attrs.style"
    :visible="popoverVisible"
    :close-on-press-escape="closeOnPressEscape"
    content-class="bg-background-100 shadow-border-menu rounded-xl"
    class="pxd-time-picker w-full"
    @escape="onCancelClick"
    @show="setTimesScrollTop"
    @outside-click="onConfirmClick"
    @visible-change="onVisibleChange"
  >
    <PInput
      :size="size"
      :error="error"
      :disabled="disabled"
      :allow-clear="allowClear"
      :model-value="modelValue"
      :placeholder="placeholder"
      :prefix-style="false"
      v-bind="$attrs"
      @change="onInputValueChange"
      @keydown.enter="onConfirmClick"
      @update:model-value="onUpdateModelValue"
    >
      <template v-if="prefixIcon" #prefix>
        <CalendarIcon class="pointer-events-none" />
      </template>
    </PInput>

    <template #content>
      <div class="text-sm flex max-w-full transform-gpu tabular-nums outline-none select-none" @click.stop="onTimeListClick">
        <div class="p-2 gap-1 relative flex items-center">
          <div class="pxd-time-picker--list relative">
            <ul ref="timeHoursRef" data-type="hour" class="w-8 h-40 px-0 m-0 py-16 scrollbar-hidden list-none overflow-x-hidden overflow-y-scroll overscroll-contain text-center outline-none" @scroll.stop="onTimeListScroll">
              <li v-for="_, i of 24" :key="i" class="h-8 leading-8 cursor-pointer">
                {{ padStringZero(i) }}
              </li>
            </ul>
          </div>
          <div class="pxd-time-picker--list relative">
            <ul ref="timeMinutesRef" data-type="minute" class="w-8 h-40 px-0 m-0 py-16 scrollbar-hidden list-none overflow-x-hidden overflow-y-scroll overscroll-contain text-center outline-none" @scroll.stop="onTimeListScroll">
              <li v-for="_, i of 60" :key="i" class="h-8 leading-8 cursor-pointer">
                {{ padStringZero(i) }}
              </li>
            </ul>
          </div>
          <div class="pxd-time-picker--list relative">
            <ul ref="timeSecondsRef" data-type="second" class="w-8 h-40 px-0 m-0 py-16 scrollbar-hidden list-none overflow-x-hidden overflow-y-scroll overscroll-contain text-center outline-none" @scroll.stop="onTimeListScroll">
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
        <PButton size="xs" variant="ghost" class="px-0! text-13px" @click="onPresetTimeClick()">
          {{ config.locale.date.now }}
        </PButton>

        <PButton size="xs" variant="ghost" class="px-0! text-13px" @click="onCancelClick">
          {{ config.locale.confirm.cancel }}
        </PButton>
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
