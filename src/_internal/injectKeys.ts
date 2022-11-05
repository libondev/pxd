import type { CheckboxGroupContext } from '../checkbox-group/src/constraints'
import type { InjectionKey } from 'vue'

export const globalSymbol = Symbol('px')

export const formSymbol = Symbol('pxForm')

export const radioGroupSymbol = Symbol('pxRadioGroup')

export const buttonGroupSymbol = Symbol('pxButtonGroup')

export const checkboxGroupSymbol: InjectionKey<CheckboxGroupContext> = Symbol('pxCheckboxGroup')
