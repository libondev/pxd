import type { ComponentSizeWithXs } from '../../types/shared/props'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import { useFormItem } from '../use-form-item.js'

interface FormControlInputs {
  id?: MaybeRefOrGetter<string | undefined>
  fallbackId?: MaybeRefOrGetter<string | undefined>
  invalid?: MaybeRefOrGetter<boolean | undefined>
  disabled?: MaybeRefOrGetter<boolean | undefined>
  readonly?: MaybeRefOrGetter<boolean | undefined>
  required?: MaybeRefOrGetter<boolean | undefined>
  size?: MaybeRefOrGetter<ComponentSizeWithXs | undefined>
}

export function useFormControl(inputs: FormControlInputs = {}) {
  const item = useFormItem()
  const id = computed(() => toValue(inputs.id) ?? item?.id ?? toValue(inputs.fallbackId) ?? '')
  const invalid = computed(() => Boolean(toValue(inputs.invalid)) || Boolean(item?.invalid))
  const disabled = computed(() => Boolean(toValue(inputs.disabled)) || Boolean(item?.disabled))
  const readonly = computed(() => Boolean(toValue(inputs.readonly)) || Boolean(item?.readonly))
  const required = computed(() => Boolean(toValue(inputs.required)) || Boolean(item?.required))
  const size = computed(() => toValue(inputs.size) ?? item?.size)
  const describedBy = computed(() => item?.describedBy)
  const labelId = computed(() => item?.labelId)

  return { id, invalid, disabled, readonly, required, size, describedBy, labelId }
}
