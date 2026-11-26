<script lang="ts" setup>
import type { ChangeAt } from '../../types/shared/change'
import type { TimePickerEmits, TimePickerProps } from './types'
import ClockIcon from '@gdsicon/vue/clock'
import { onBeforeUnmount, shallowRef, watch } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useFieldAttrs } from '../../composables/_internal/use-field-attrs.js'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from '../../composables/use-media-query.js'
import { POPOVER_PANEL_CLASS } from '../../constants/popover-panel.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { dayjs } from '../../utils/date.js'
import { getElement } from '../../utils/dom.js'
import { clampValue } from '../../utils/format.js'
import { isNil } from '../../utils/is.js'
import PButton from '../button/index.vue'
import PInput from '../input/index.vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PTimePicker',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TimePickerProps>(), {
  modelValue: '',
  suffixIcon: true,
  showSeconds: true,
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
const scrollTimers: ReturnType<typeof setTimeout>[] = []

const timeHoursRef = shallowRef<HTMLElement>()
const timeMinutesRef = shallowRef<HTMLElement>()
const timeSecondsRef = shallowRef<HTMLElement>()

const popoverVisible = shallowRef(false)
const fieldRef = shallowRef<InstanceType<typeof PInput>>()

const dayjsDateTime = shallowRef<dayjs.Dayjs | null>(null)
const committedValue = shallowRef<string | number>('')

const configProvider = useConfigProvider()

const isSheet = useMediaQuery(PRESET_MEDIA_QUERIES.IS_XS)
const { fieldAttrs, popoverAttrs } = useFieldAttrs()
const { modelValue, change } = useModelValue(props, emits, {
  get() {
    return dayjsDateTime.value ? dayjsDateTime.value.format(props.labelFormat ?? 'HH:mm:ss') : ''
  },
})
useAgentNode({
  name: 'time-picker',
  namedBy: 'field',
  el: () => getElement(fieldRef),
  state: () => ({ value: modelValue.value ?? '' }),
  actions: {
    setValue: (value) => {
      change(String(value ?? ''), { reason: 'api' })
    },
  },
})

const onTimeListScroll = (ev: Event) => {
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
}
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

    el?.scrollTo({ top: scrollTop, behavior: 'instant' })
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

function formatEmittedValue() {
  if (!dayjsDateTime.value) {
    return ''
  }

  if (props.valueFormat === 'timestamp') {
    return dayjsDateTime.value.valueOf()
  }

  return dayjsDateTime.value.format(props.valueFormat)
}

function updateModelValue(at: ChangeAt) {
  const nextValue = formatEmittedValue()

  if (committedValue.value === nextValue) {
    return
  }

  committedValue.value = nextValue
  change(nextValue, at)
}

function syncFromModelValue(value: TimePickerProps['modelValue']) {
  updateDayjsDateTime(value)
  committedValue.value = formatEmittedValue()
}

function onInputValueChange(value: string) {
  if (value === '') {
    updateDayjsDateTime('')
    updateModelValue({ reason: 'cleared' })
    togglePopoverVisible(false)
    return
  }

  const newDateTime = getFormattedValue(value)
  if (newDateTime.isValid()) {
    dayjsDateTime.value = newDateTime
    updateModelValue({ reason: 'typed' })
  }

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
  updateModelValue({ reason: 'item-press', event: ev })
  togglePopoverVisible(false)
}

function onSetNowClick() {
  updateDayjsDateTime(new Date())
  updateModelValue({ reason: 'trigger-press' })
  togglePopoverVisible(false)
}

function onCancelClick() {
  updateDayjsDateTime(props.modelValue)
  togglePopoverVisible(false)
}

watch(() => props.modelValue, syncFromModelValue, { immediate: true })

onBeforeUnmount(() => {
  scrollTimers.forEach((timer) => clearTimeout(timer))
})
</script>

<template>
  <PPopover
    data-time-picker
    as-child
    :aria-target="fieldRef?.input"
    v-model="popoverVisible"
    class="pxd-time-picker w-full"
    trigger="click"
    :disabled="disabled"
    v-bind="popoverAttrs"
    :toggle-on-trigger="false"
    :content-class="POPOVER_PANEL_CLASS"
    @show="setTimesScrollTop"
    @outside-click="(event: PointerEvent) => updateModelValue({ reason: 'outside-press', event })"
  >
    <PInput
      ref="fieldRef"
      :id="id"
      :size="size"
      :invalid="invalid"
      :disabled="disabled"
      :readonly="isSheet"
      :clearable="clearable"
      :model-value="modelValue"
      :placeholder="placeholder"
      :default-suffix-style="false"
      :input-attrs="fieldAttrs"
      :data-focusing="popoverVisible"
      @clear="onInputValueChange"
      @change="onInputValueChange"
      @keydown.enter="togglePopoverVisible(true)"
    >
      <template #suffix>
        <slot name="suffix">
          <ClockIcon v-if="suffixIcon" class="me-(--input-ip)" />
        </slot>
      </template>
    </PInput>

    <template #content>
      <div class="p-1.5 gap-1 flex items-center justify-between border-b" @click.stop>
        <PButton
          size="xs"
          variant="ghost"
          class="rounded-md"
          :text="configProvider.locale.interaction.cancel"
          @click="onCancelClick"
        />

        <PButton
          size="xs"
          variant="ghost"
          class="rounded-md"
          :text="configProvider.locale.date.now"
          @click="onSetNowClick"
        />
      </div>

      <div
        class="sm:text-[0.9375rem] max-sm:text-base flex max-w-full transform-gpu items-stretch tabular-nums outline-none select-none"
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
              <li
                v-for="i of paddedTimes.hours"
                :key="i"
                class="pxd-time-picker--item h-8 leading-8 cursor-pointer"
              >
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
              <li
                v-for="i of paddedTimes.minutes"
                :key="i"
                class="pxd-time-picker--item h-8 leading-8 cursor-pointer"
              >
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
              <li
                v-for="i of paddedTimes.seconds"
                :key="i"
                class="pxd-time-picker--item h-8 leading-8 cursor-pointer"
              >
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
            type="button"
            :data-index="i"
            class="px-1.5 py-0.5 leading-4 text-xs cursor-pointer appearance-none rounded-sm border-none bg-gray-300 font-inherit whitespace-nowrap text-foreground self-focus-ring outline-none hover:bg-gray-400 active:bg-gray-500 motion-safe:transition-colors"
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
    mask-image: linear-gradient(to bottom, transparent 0%, black 50%, black 60%, transparent 100%);
  }
}
</style>
