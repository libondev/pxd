import type { ComponentSizeWithXs } from './props'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'

export type FormValidateOn = 'blur' | 'change'
export type FormPath = string | ReadonlyArray<string | number>
export type FormLabelPosition = 'top' | 'left' | 'right' | 'inline'

export interface FormError {
  name: FormPath
  message: string
}

export type StandardSchemaIssue = {
  readonly message: string
  readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }> | undefined
}

export type StandardSchemaResult<Output = unknown> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<StandardSchemaIssue> }

export interface StandardSchema<Output = unknown> {
  readonly '~standard': {
    readonly version: 1
    readonly vendor: string
    readonly validate: (
      value: unknown,
    ) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>
    readonly types?: { readonly input: unknown; readonly output: Output } | undefined
  }
}

export interface FormValidatePayload {
  name?: FormPath
  valid: boolean
  errors: FormError[]
}

export interface FormItemRegistration {
  name: FormPath
  rules?: MaybeRefOrGetter<StandardSchema | undefined>
}

export interface UseFormOptions<M extends Record<string, any>, Output = M> {
  model: MaybeRefOrGetter<M>
  schema?: MaybeRefOrGetter<StandardSchema<Output> | undefined>
  validate?: (model: M) => FormError[] | Promise<FormError[]>
  initialValues?: MaybeRefOrGetter<Partial<M> | undefined>
  validateOn?: FormValidateOn[]
  debounce?: number
  onValidate?: (payload: FormValidatePayload) => void
}

export interface UseFormReturn<M extends Record<string, any>, Output = M> {
  errors: Readonly<Ref<FormError[]>>
  unmatchedErrors: ComputedRef<FormError[]>
  isValidating: Readonly<Ref<boolean>>
  isValid: ComputedRef<boolean>
  isDirty: Readonly<Ref<boolean>>
  isSubmitted: Readonly<Ref<boolean>>
  validate: (...names: FormPath[]) => Promise<boolean>
  validateField: (name: FormPath) => Promise<boolean>
  submit: () => Promise<{ valid: boolean; data?: Output; errors: FormError[] }>
  reset: (name?: FormPath) => void
  setInitialValues: (values?: Partial<M> | M) => void
  setErrors: (errors: FormError[]) => void
  clearErrors: (name?: FormPath) => void
  getFieldErrors: (name: FormPath) => readonly string[]
  isTouched: (name: FormPath) => boolean
  markTouched: (name: FormPath) => void
  registerItem: (item: FormItemRegistration) => void
  unregisterItem: (name: FormPath) => void
}

export interface FormContext {
  form: UseFormReturn<any, any>
  model: Record<string, any>
  id: string
  validateOn: FormValidateOn[]
  disabled?: boolean
  readonly?: boolean
  size?: ComponentSizeWithXs
  labelPosition: FormLabelPosition
  labelWidth?: string
  requiredMark: boolean | 'optional'
}

export interface FormControlAttrs {
  id: string
  required?: boolean
  'aria-invalid'?: true
  'aria-describedby'?: string
  'aria-required'?: true
}

export interface FormControlBinding extends FormControlAttrs {
  modelValue?: unknown
  'onUpdate:modelValue'?: (value: unknown) => void
}

export interface FormItemContext {
  id: string
  labelId: string
  describedBy?: string
  invalid: boolean
  required: boolean
  disabled?: boolean
  readonly?: boolean
  size?: ComponentSizeWithXs
  validate: (trigger?: FormValidateOn) => Promise<boolean>
  reset: () => void
}
