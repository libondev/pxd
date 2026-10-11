<script lang="ts" setup>
import type { HueTextProps } from './types'
import { computed } from 'vue'

defineOptions({
  name: 'PHueText',
  inheritAttrs: false,
})

const props = defineProps<HueTextProps>()

const hueCache = new Map<string, string>()

const SATURATION = 35
const LIGHTNESS = 55

function hue2rgb(p: number, q: number, t: number) {
  let value = t

  if (value < 0) {
    value += 1
  }
  if (value > 1) {
    value -= 1
  }
  if (value < 1 / 6) {
    return p + (q - p) * 6 * value
  }
  if (value < 1 / 2) {
    return q
  }
  if (value < 2 / 3) {
    return p + (q - p) * (2 / 3 - value) * 6
  }

  return p
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue = (((h % 360) + 360) % 360) / 360
  const saturation = s / 100
  const lightness = l / 100

  if (saturation === 0) {
    const value = Math.max(0, Math.round(lightness * 255))

    return [value, value, value]
  }

  const q =
    lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation
  const p = 2 * lightness - q

  return [
    Math.max(0, Math.round(hue2rgb(p, q, hue + 1 / 3) * 255)),
    Math.max(0, Math.round(hue2rgb(p, q, hue) * 255)),
    Math.max(0, Math.round(hue2rgb(p, q, hue - 1 / 3) * 255)),
  ]
}

function toHex(value: number) {
  return value.toString(16).padStart(2, '0').slice(0, 2)
}

function getHueColor(name: string) {
  const cached = hueCache.get(name)
  if (cached) {
    return cached
  }

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  const rgb = hslToRgb(hash, SATURATION, LIGHTNESS)
  const result = `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`

  hueCache.set(name, result)

  return result
}

const color = computed(() => getHueColor(props.text ?? ''))

const hueStyle = computed(() => {
  return props.tinted
    ? {
        color: color.value,
        backgroundColor: `color-mix(in srgb, ${color.value} 12%, transparent)`,
      }
    : { color: color.value }
})
</script>

<template>
  <span
    class="pxd-hue-text gap-1 inline-flex max-w-full items-center"
    :style="hueStyle"
    v-bind="$attrs"
  >
    <span v-if="$slots.prefix" class="inline-flex items-center">
      <slot name="prefix" />
    </span>
    {{ text }}
    <span v-if="$slots.suffix" class="inline-flex items-center">
      <slot name="suffix" />
    </span>
  </span>
</template>
