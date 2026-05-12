<script lang="ts" setup>
import type { TimePickerEmits, TimePickerProps } from './types'
import CalendarIcon from '@gdsicon/vue/calendar'
import { isNil } from 'es-toolkit'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { usePopoverResponsive } from '../../composables/use-popover-responsive'
import { useConfigProvider } from '../../contexts/config-provider'
import { dayjs } from '../../utils/date'
import { clampValue } from '../../utils/format'
import { throttleByRaf } from '../../utils/event'
import PButton from '../button/index.vue'
import PInput from '../input/index.vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PTimePicker',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<TimePickerProps>(), {
  modelValue: '',
  prefixIcon: true,
  showSeconds: true,
  closeOnPressEscape: true,
  presets: () => [],
  format: 'HH:mm:ss',
  valueFormat: 'HH:mm:ss',
})

const emits = defineEmits<TimePickerEmits>()

const HEIGHT = 32
const VALUE_POSITION_MAP = {
  hour: 0,
  minute: 1,
  second: 2,
} as const

const paddedTimes = {
  hours: Array.from({ length: 24 }, (_, i) => padStringZero(i)),
  minutes: Array.from({ length: 60 }, (_, i) => padStringZero(i)),
  seconds: Array.from({ length: 60 }, (_, i) => padStringZero(i)),
}

const configProvider = useConfigProvider()

const { isAdaptive, responsiveClasses } = usePopoverResponsive()

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
    emits('change', value)
    emits('update:modelValue', value)
  },
})

const scrollTimers: ReturnType<typeof setTimeout>[] = []

const onTimeListScroll = throttleByRaf((ev: Event) => {
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

    if (!dayjsDateTime.value) {
      return
    }

    dayjsDateTime.value = dayjsDateTime.value.set(type, clampedValue)
  }, 100)
})

function padStringZero(value: number | string): string {
  return String(value).padStart(2, '0')
}

function togglePopoverVisible(visible: boolean) {
  popoverVisible.value = visible
}

function updateDayjsDateTime(value: TimePickerProps['modelValue']) {
  if (!value) {
    dayjsDateTime.value = null
    return
  }

  const newDateTime = getFormattedValue(value)
  dayjsDateTime.value = newDateTime.isValid() ? newDateTime : null
}

function getFormattedValue(value: TimePickerProps['modelValue']) {
  if (isNil(value) || value === '') {
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

function setTimesScrollTop() {
  if (!dayjsDateTime.value) {
    dayjsDateTime.value = dayjs()
  }

  const elList = [timeHoursRef.value, timeMinutesRef.value, timeSecondsRef.value]
  const modelValueList = [
    dayjsDateTime.value!.hour(),
    dayjsDateTime.value!.minute(),
    dayjsDateTime.value!.second(),
  ]

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

function updateModelValue() {
  modelValue.value = dayjsDateTime.value ? dayjsDateTime.value.format(props.valueFormat) : ''
}

function onInputValueChange(value: string) {
  updateDayjsDateTime(value)
  updateModelValue()
  togglePopoverVisible(false)
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

  updateDayjsDateTime(presetValue)
  updateModelValue()
  togglePopoverVisible(false)
}

function onSetNowClick() {
  updateDayjsDateTime(new Date())
  updateModelValue()
  togglePopoverVisible(false)
}

function onCancelClick() {
  updateDayjsDateTime(props.modelValue)
  togglePopoverVisible(false)
}

watch(() => props.modelValue, updateDayjsDateTime, { immediate: true })

onBeforeUnmount(() => {
  scrollTimers.forEach((timer) => clearTimeout(timer))
  onTimeListScroll.cancel()
})
</script>

<template>
  <PPopover
    v-model="popoverVisible"
    class="pxd-time-picker w-full"
    trigger="click"
    :disabled="disabled"
    :class="$attrs.class"
    :style="$attrs.style"
    :toggle-on-trigger="false"
    :adaptive="isAdaptive"
    :wrapper-class="responsiveClasses.wrapper"
    :content-class="responsiveClasses.content"
    :lock-scroll-on-visible="isAdaptive"
    :close-on-press-escape="closeOnPressEscape"
    @show="setTimesScrollTop"
    @outside-click="updateModelValue"
  >
    <PInput
      :size="size"
      :error="error"
      :disabled="disabled"
      :readonly="isAdaptive"
      :clearable="clearable"
      :model-value="modelValue"
      :placeholder="placeholder"
      :default-prefix-style="false"
      :data-focusing="popoverVisible"
      :select-on-focus="!isAdaptive"
      v-bind="$attrs"
      @clear="onInputValueChange"
      @change="onInputValueChange"
      @keydown.enter="togglePopoverVisible(true)"
    >
      <template v-if="prefixIcon" #prefix>
        <CalendarIcon class="ml-3" />
      </template>
    </PInput>

    <template #content>
      <div class="p-1.5 gap-1 flex items-center justify-between border-b" @click.stop>
        <PButton size="sm" variant="ghost" class="sm:px-0.5 text-13" @click="onCancelClick">
          {{ configProvider.locale.confirm.cancel }}
        </PButton>

        <PButton size="sm" variant="ghost" class="sm:px-0.5 text-13" @click="onSetNowClick">
          {{ configProvider.locale.date.now }}
        </PButton>
      </div>

      <div
        class="sm:text-15 max-sm:text-base flex max-w-full transform-gpu items-stretch tabular-nums outline-none select-none"
        @click.stop="onTimeListClick"
      >
        <div class="p-2 gap-1 relative mx-auto flex items-center">
          <div class="pxd-time-picker--list relative">
            <ul
              ref="timeHoursRef"
              data-type="hour"
              class="w-16 sm:w-12 h-40 px-0 m-0 py-16 relative scrollbar-none list-none overflow-x-hidden overflow-y-scroll overscroll-contain text-center outline-none motion-safe:transition-colors"
              @scroll.stop="onTimeListScroll"
            >
              <li v-for="i of paddedTimes.hours" :key="i" class="h-8 leading-8 cursor-pointer">
                {{ i }}
              </li>
            </ul>
          </div>
          <div class="pxd-time-picker--list relative">
            <ul
              ref="timeMinutesRef"
              data-type="minute"
              class="w-16 sm:w-12 h-40 px-0 m-0 py-16 relative scrollbar-none list-none overflow-x-hidden overflow-y-scroll overscroll-contain text-center outline-none motion-safe:transition-colors"
              @scroll.stop="onTimeListScroll"
            >
              <li v-for="i of paddedTimes.minutes" :key="i" class="h-8 leading-8 cursor-pointer">
                {{ i }}
              </li>
            </ul>
          </div>
          <div v-if="showSeconds" class="pxd-time-picker--list relative">
            <ul
              ref="timeSecondsRef"
              data-type="second"
              class="w-16 sm:w-12 h-40 px-0 m-0 py-16 relative scrollbar-none list-none overflow-x-hidden overflow-y-scroll overscroll-contain text-center outline-none motion-safe:transition-colors"
              @scroll.stop="onTimeListScroll"
            >
              <li v-for="i of paddedTimes.seconds" :key="i" class="h-8 leading-8 cursor-pointer">
                {{ i }}
              </li>
            </ul>
          </div>
        </div>

        <div
          v-if="presets?.length"
          class="max-sm:w-36 sm:w-25 p-2 gap-1 scrollbar-none flex flex-wrap content-start self-stretch overflow-auto border-l outline-none"
          @click="onPresetClick"
        >
          <button
            v-for="(preset, i) in presets"
            :key="preset.label"
            :data-index="i"
            class="px-1.5 py-0.5 sm:text-13 sm:leading-4 max-sm:leading-5 max-sm:text-sm cursor-pointer appearance-none rounded-sm border-none bg-gray-300 font-inherit whitespace-nowrap text-foreground self-focus-ring outline-none hover:bg-gray-400 active:bg-gray-500 motion-safe:transition-appearance"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>
    </template>
  </PPopover>
</template>

<style lang="postcss">
.pxd-time-picker--list {
  &::before,
  &::after {
    content: '';
    position: absolute;
    left: -0.125rem;
    right: -0.125rem;
    height: 4rem;
    pointer-events: none;
    z-index: 1;
  }

  &::before {
    border-bottom: 1px solid hsl(var(--color-gray-300-value));
    top: 0;
  }

  &::after {
    border-top: 1px solid hsl(var(--color-gray-300-value));
    bottom: 0;
  }

  & > ul {
    -webkit-overflow-scrolling: auto;
    /* py-16(64px) / h-40(160px) = 40% */
    mask-image: linear-gradient(to bottom, transparent 0%, black 50%, black 60%, transparent 100%);
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      black 50%,
      black 60%,
      transparent 100%
    );
  }
}
</style>
