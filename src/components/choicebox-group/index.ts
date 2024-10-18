import type { InjectionKey, Ref } from 'vue'

export interface ChoiceboxProps {
  title?: string
  multiple?: boolean
  direction?: 'row' | 'col'
}

export interface ChoiceboxProvider {
  multiple: Ref<boolean>
  modelValue: Ref<string | string[]>
  onChoiceboxItemChange: (value: string) => void
}

export const ChoiceboxInjectionKey: InjectionKey<ChoiceboxProvider> = Symbol('choiceboxProvider')

export { default } from './src/choicebox-group.vue'
