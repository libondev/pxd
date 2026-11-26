import type { FormContext, FormItemContext } from '../types/shared/form'
import { createContext } from '../utils/_internal/context.js'

export const [provideFormContext, useFormContext] = createContext<FormContext>('Form', null)

export const [provideFormItemContext, useFormItemContext] = createContext<FormItemContext>(
  'FormItem',
  null,
)
