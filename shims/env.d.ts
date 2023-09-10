/// <reference types="vite/client" />

export { }

declare global {
  export type { Component as _C, App, ComponentPublicInstance, ComputedRef, InjectionKey, PropType, Ref, VNode } from 'vue'

  export type Component = _C & { name: string }

  export type Direction = 'horizontal' | 'vertical'

  export interface OptionItem {
    label: string
    value: string
    disabled?: boolean
  }
}
