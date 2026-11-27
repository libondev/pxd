<script lang="ts" setup generic="Output = unknown">
import type { FormContext, FormError, FormPath } from '../../types/shared/form'
import type { FormEmits, FormProps } from './types'
import { computed, nextTick, shallowRef } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useForm } from '../../composables/use-form.js'
import { provideFormContext } from '../../contexts/form.js'
import { formatPath } from '../../utils/_internal/form-path.js'
import { getUniqueId } from '../../utils/helper.js'

defineOptions({
  name: 'PForm',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FormProps<Output>>(), {
  validateOn: () => ['blur', 'change'],
  debounce: 300,
  labelPosition: 'top',
  requiredMark: true,
  scrollToError: true,
  pending: false,
})

const emits = defineEmits<FormEmits<Output>>()

const formId = props.id ?? getUniqueId('p-form')

let formSubmitPromise: Promise<{ valid: boolean; data?: Output; errors: FormError[] }> | undefined

const formRef = shallowRef<HTMLFormElement>()

const form = useForm<Record<string, any>, Output>({
  model: () => props.model,
  schema: () => props.schema,
  validate: (model) => props.validate?.(model) ?? [],
  validateOn: props.validateOn,
  debounce: props.debounce,
  onValidate: (payload) => emits('validate', payload),
})

const formContext: FormContext = {
  form,
  get model() {
    return props.model
  },
  id: formId,
  get validateOn() {
    return props.validateOn
  },
  get disabled() {
    return props.disabled
  },
  get readonly() {
    return props.readonly
  },
  get size() {
    return props.size
  },
  get labelPosition() {
    return props.labelPosition
  },
  get labelWidth() {
    return props.labelWidth
  },
  get requiredMark() {
    return props.requiredMark
  },
}
const unmatchedErrors = form.unmatchedErrors

const isBusy = computed(() => props.pending || form.isValidating.value)

useAgentNode({
  name: 'form',
  el: () => formRef.value,
  state: () => ({
    valid: form.isValid.value,
    dirty: form.isDirty.value,
    submitted: form.isSubmitted.value,
    errorCount: form.errors.value.length,
    invalidFields: [
      ...new Set(
        form.errors.value.map((error) => formatPath(error.name)).filter((name) => name !== ''),
      ),
    ],
  }),
  pending: () => props.pending || form.isValidating.value,
  secret: () => false,
  actions: {
    validate: () => form.validate(),
    submit: () => submitForAgent(),
  },
})

async function focusFirst(name?: FormPath): Promise<void> {
  await nextTick()

  const root = formRef.value

  if (!root) {
    return
  }

  const key = name == null ? '' : formatPath(name)
  const item = Array.from(root.querySelectorAll<HTMLElement>('[data-form-item-name]')).find(
    (element) => element.dataset.formItemName === key,
  )

  if (!item) {
    root.focus()
    root.scrollIntoView?.({ block: 'center' })

    return
  }

  const focusable = item.querySelector<HTMLElement>(
    'input:not([type="hidden"]), textarea, select, button, [tabindex]:not([tabindex="-1"])',
  )
  const element = focusable ?? item

  element.scrollIntoView?.({ block: 'center' })
  element.focus()
}

async function submitForm(
  originalEvent?: Event,
): Promise<{ valid: boolean; data?: Output; errors: FormError[] }> {
  if (!formSubmitPromise) {
    formSubmitPromise = runSubmitForm(originalEvent).finally(() => {
      formSubmitPromise = undefined
    })
  }

  return formSubmitPromise
}

async function runSubmitForm(
  originalEvent?: Event,
): Promise<{ valid: boolean; data?: Output; errors: FormError[] }> {
  const result = await form.submit()

  if (!result.valid) {
    emits('invalid', { errors: result.errors, first: result.errors[0] })

    return result
  }

  emits('submit', { data: result.data as Output, originalEvent })

  return result
}

async function submitForAgent(): Promise<{
  valid: boolean
  errorCount: number
  invalidFields: string[]
}> {
  const result = await submitForm()

  return {
    valid: result.valid,
    errorCount: result.errors.length,
    invalidFields: [
      ...new Set(
        result.errors.map((error) => formatPath(error.name)).filter((name) => name !== ''),
      ),
    ],
  }
}

async function onSubmit(event: Event): Promise<void> {
  const result = await submitForm(event)

  if (!result.valid && props.scrollToError) {
    await focusFirst(result.errors[0]?.name)
  }
}

function resetForm(name?: FormPath): void {
  form.reset(name)
  emits('reset')
}

provideFormContext(formContext)

defineExpose({
  validate: form.validate,
  validateField: form.validateField,
  reset: resetForm,
  setInitialValues: form.setInitialValues,
  clearErrors: form.clearErrors,
  setErrors: form.setErrors,
  errors: form.errors,
  isValidating: form.isValidating,
  isValid: form.isValid,
  isDirty: form.isDirty,
  isSubmitted: form.isSubmitted,
})
</script>

<template>
  <form
    ref="formRef"
    data-form
    :id="formId"
    class="pxd-form outline-none"
    novalidate
    tabindex="-1"
    :aria-busy="isBusy || undefined"
    v-bind="$attrs"
    @submit.prevent="onSubmit"
  >
    <div v-if="unmatchedErrors.length" data-form-error role="alert" class="text-xs text-red-900">
      <slot name="error-message" :errors="unmatchedErrors" :first="unmatchedErrors[0]">
        <div v-for="(error, index) in unmatchedErrors" :key="`${formatPath(error.name)}-${index}`">
          {{ error.message }}
        </div>
      </slot>
    </div>

    <slot />
  </form>
</template>
