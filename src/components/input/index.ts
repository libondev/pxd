import type { StandardSize } from '#types'
import { getStandardSize } from '#utils/css.js'

export const getInputSizes = getStandardSize()

export type InputSizes = StandardSize

export { default } from './src/input.vue'
