import type { InjectionKey, Ref } from 'vue'

export interface TriggerItem {
  label: string
  value: string
}

export type Triggers = Record<string, string>

export const TriggerSymbol: InjectionKey<Ref<Triggers>> = Symbol('TriggerSymbol')

export { default } from './src/tabs.vue'
