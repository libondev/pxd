import type {
  FormError,
  FormLabelPosition,
  FormValidateOn,
  FormValidatePayload,
  StandardSchema,
} from '../../types/shared/form'
import type { ComponentSizeWithXs } from '../../types/shared/props'

export interface FormProps<Output = unknown> {
  id?: string
  model: Record<string, any>
  schema?: StandardSchema<Output>
  validate?: (model: Record<string, any>) => FormError[] | Promise<FormError[]>
  validateOn?: FormValidateOn[]
  debounce?: number
  labelPosition?: FormLabelPosition
  labelWidth?: string
  requiredMark?: boolean | 'optional'
  size?: ComponentSizeWithXs
  disabled?: boolean
  readonly?: boolean
  scrollToError?: boolean
  pending?: boolean
}

export interface FormEmits<Output = unknown> {
  submit: [{ data: Output; originalEvent?: Event }]
  invalid: [{ errors: FormError[]; first: FormError | undefined }]
  validate: [payload: FormValidatePayload]
  reset: []
}
