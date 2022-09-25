import type { NATIVE_BUTTON_TYPES, SIZE, VARIANTS } from '../_props/index'

export type Sizes = typeof SIZE[number]

export type VariantState = typeof VARIANTS[number]

export type NativeButton = typeof NATIVE_BUTTON_TYPES[number]

export type CSSUnitValue = `${number}${'px' | 'rem' | 'em' | 'vw' | 'vh' | 'vmin' | 'vmax'}`
