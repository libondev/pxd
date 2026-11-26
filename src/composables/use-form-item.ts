import type { FormItemContext } from '../types/shared/form'
import { useFormItemContext } from '../contexts/form.js'

export function useFormItem(): FormItemContext | null {
  return useFormItemContext(null)
}
