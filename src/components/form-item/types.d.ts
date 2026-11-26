import type { FormLabelPosition, FormPath, StandardSchema } from '../../types/shared/form'
import type { Component, VNodeChild } from 'vue'

export interface FormItemProps {
  name?: FormPath
  label?: string
  description?: string
  hint?: string
  required?: boolean
  error?: string | null
  errorPattern?: RegExp
  rules?: StandardSchema
  for?: string
  labelWidth?: string
  labelPosition?: FormLabelPosition
  showMessage?: boolean
  component?: Component | string
  componentProps?: Record<string, unknown>
  componentSlots?: Record<string, (props?: Record<string, unknown>) => VNodeChild>
}
