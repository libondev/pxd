<script lang="ts" setup>
import type {
  FormControlAttrs,
  FormControlBinding,
  FormItemContext,
  FormValidateOn,
} from '../../types/shared/form'
import type { FormItemProps } from './types'
import { computed, onBeforeUnmount, onMounted, shallowRef, useSlots, watch } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { provideFormItemContext, useFormContext } from '../../contexts/form.js'
import { formatPath, getPath, setPath, slugifyPath } from '../../utils/_internal/form-path.js'
import { getUniqueId } from '../../utils/helper.js'

defineOptions({
  name: 'PFormItem',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FormItemProps>(), {
  showMessage: true,
})

const fallbackId = getUniqueId('p-form-item')

const itemRef = shallowRef<HTMLElement>()
const path = computed(() => (props.name == null ? '' : formatPath(props.name)))
const hasName = computed(() => path.value !== '')
const isRequired = computed(() => props.required ?? false)
const manualError = computed(() => (props.error ? props.error : undefined))
const isNative = computed(() => typeof props.component === 'string')
const nativeType = computed(() => String(props.componentProps?.type ?? ''))
const nativeValue = computed(() => props.componentProps?.value ?? true)
const autoProps = computed<Record<string, unknown>>(() => {
  const base = props.componentProps ?? {}

  if (isNative.value) {
    const control = { ...base, ...attrs.value }

    if (nativeType.value === 'checkbox' || nativeType.value === 'radio') {
      return {
        ...control,
        checked:
          nativeType.value === 'radio'
            ? value.value === nativeValue.value
            : Array.isArray(value.value)
              ? value.value.includes(nativeValue.value)
              : Boolean(value.value),
        value: nativeValue.value,
        onChange: onNativeCheckedChange,
      }
    }

    return {
      ...control,
      value: value.value ?? '',
      onInput: onNativeInput,
      onChange: onNativeInput,
    }
  }

  return {
    ...base,
    id: controlId.value,
    invalid: invalid.value || undefined,
    modelValue: value.value,
    'onUpdate:modelValue': setValue,
  }
})
const autoSlots = computed(() => (isNative.value ? {} : (props.componentSlots ?? {})))

const slots = useSlots()

const hasLabel = computed(() => Boolean(props.label || slots.label))
const hasDescription = computed(() => Boolean(props.description || slots.description))

const form = useFormContext(null)

const controlId = computed(() =>
  hasName.value && form ? `${form.id}-${slugifyPath(path.value)}` : fallbackId,
)
const labelId = computed(() => `${controlId.value}-label`)
const descriptionId = computed(() => `${controlId.value}-description`)
const errorId = computed(() => `${controlId.value}-error`)
const position = computed(() => props.labelPosition ?? form?.labelPosition ?? 'top')
const width = computed(() => props.labelWidth ?? form?.labelWidth)
const itemStyle = computed<Record<string, string> | undefined>(() =>
  width.value ? { '--form-label-width': width.value } : undefined,
)
const formErrors = computed(() => {
  if (!form) {
    return []
  }

  const pattern = props.errorPattern

  if (pattern) {
    return form.form.errors.value
      .filter((error) => {
        pattern.lastIndex = 0

        return pattern.test(formatPath(error.name))
      })
      .map((error) => error.message)
  }

  if (!hasName.value) {
    return []
  }

  return form.form.getFieldErrors(path.value)
})
const invalid = computed(() => {
  const message = manualError.value ?? formErrors.value[0]

  if (!message) {
    return false
  }

  if (manualError.value || props.errorPattern) {
    return true
  }

  return !form || form.form.isSubmitted.value || form.form.isTouched(path.value)
})
const visibleErrors = computed<readonly string[]>(() => {
  if (!invalid.value) {
    return []
  }

  return manualError.value ? [manualError.value] : [...formErrors.value]
})
const error = computed(() => visibleErrors.value[0])
const isTouched = computed(() => (hasName.value && form ? form.form.isTouched(path.value) : false))
const describedBy = computed(() => {
  const ids: string[] = []

  if (hasDescription.value) {
    ids.push(descriptionId.value)
  }

  if (props.showMessage && visibleErrors.value.length) {
    ids.push(errorId.value)
  }

  return ids.join(' ') || undefined
})

const itemContext: FormItemContext = {
  get id() {
    return controlId.value
  },
  get labelId() {
    return labelId.value
  },
  get describedBy() {
    return describedBy.value
  },
  get invalid() {
    return invalid.value
  },
  get required() {
    return isRequired.value
  },
  get disabled() {
    return form?.disabled
  },
  get readonly() {
    return form?.readonly
  },
  get size() {
    return form?.size
  },
  validate,
  reset,
}

const value = computed({
  get: () => (hasName.value && form ? getPath(form.model, path.value) : undefined),
  set: (next) => {
    if (hasName.value && form) {
      setPath(form.model, path.value, next)
    }
  },
})

const attrs = computed<FormControlAttrs>(() => ({
  id: controlId.value,
  required: isRequired.value || undefined,
  'aria-invalid': invalid.value || undefined,
  'aria-describedby': describedBy.value,
  'aria-required': isRequired.value || undefined,
}))
const control = computed<FormControlBinding>(() => ({
  ...attrs.value,
  modelValue: value.value,
  'onUpdate:modelValue': (next: unknown) => {
    value.value = next
  },
}))
const slotProps = computed(() => ({
  control: control.value,
  attrs: attrs.value,
  value: value.value,
  setValue,
  error: error.value,
  errors: visibleErrors.value,
  invalid: invalid.value,
  validate,
  reset,
}))

const configProvider = useConfigProvider()

const resolvedHint = computed(
  () =>
    props.hint ??
    (form?.requiredMark === 'optional' && !isRequired.value
      ? configProvider.locale.form.optional
      : undefined),
)

function setValue(next: unknown): void {
  value.value = next
}

function onNativeInput(event: Event): void {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement

  value.value = target.value
}

function onNativeCheckedChange(event: Event): void {
  const target = event.target as HTMLInputElement

  if (nativeType.value === 'radio') {
    value.value = nativeValue.value

    return
  }

  if (Array.isArray(value.value)) {
    value.value = target.checked
      ? [...value.value, nativeValue.value]
      : value.value.filter((entry) => entry !== nativeValue.value)

    return
  }

  value.value = target.checked
}

function validate(_trigger?: FormValidateOn): Promise<boolean> {
  if (!form || !hasName.value) {
    return Promise.resolve(true)
  }

  return form.form.validateField(path.value)
}

function reset(): void {
  if (form && hasName.value) {
    form.form.reset(path.value)
  }
}

function clearErrors(): void {
  if (form && hasName.value) {
    form.form.clearErrors(path.value)
  }
}

function onFocusout(event: FocusEvent): void {
  const root = itemRef.value
  const next = event.relatedTarget

  if (root && next && root.contains(next as Node)) {
    return
  }

  if (!form || !hasName.value) {
    return
  }

  form.form.markTouched(path.value)

  if (form.validateOn.includes('blur')) {
    void form.form.validateField(path.value)
  }
}

watch(
  () => path.value,
  (next, previous) => {
    if (!form) {
      return
    }

    if (previous) {
      form.form.unregisterItem(previous)
    }

    if (next) {
      form.form.registerItem({ name: next, rules: () => props.rules })
    }
  },
)

provideFormItemContext(itemContext)

onMounted(() => {
  if (form && hasName.value) {
    form.form.registerItem({ name: path.value, rules: () => props.rules })
  }
})

onBeforeUnmount(() => {
  if (form && hasName.value) {
    form.form.unregisterItem(path.value)
  }
})

defineExpose({
  validate,
  reset,
  clearErrors,
  error,
  invalid,
})
</script>

<template>
  <div
    ref="itemRef"
    data-form-item
    :data-form-item-name="hasName ? path : undefined"
    :data-invalid="invalid || undefined"
    :data-touched="isTouched || undefined"
    :data-label-position="position"
    role="group"
    :aria-labelledby="hasLabel ? labelId : undefined"
    class="pxd-form-item gap-1 flex flex-col"
    :style="itemStyle"
    v-bind="$attrs"
    @focusout="onFocusout"
  >
    <div v-if="hasLabel || resolvedHint" class="pxd-form-item--head gap-2 flex items-baseline">
      <label
        v-if="hasLabel"
        :id="labelId"
        :for="props.for ?? controlId"
        class="pxd-form-item--label text-sm text-gray-900"
      >
        <slot name="label">{{ label }}</slot>
        <span v-if="isRequired" class="pxd-form-item--required text-red-900" aria-hidden="true">
          *
        </span>
      </label>

      <span
        v-if="resolvedHint"
        class="pxd-form-item--hint text-xs ms-auto text-foreground-secondary"
      >
        {{ resolvedHint }}
      </span>
    </div>

    <div class="pxd-form-item--body min-w-0 gap-1 flex flex-col">
      <slot v-if="$slots.default" v-bind="slotProps" />

      <component v-else-if="component" :is="component" v-bind="autoProps">
        <template v-for="(slot, name) in autoSlots" :key="name" #[name]="slotProps">
          <component :is="slot" v-bind="slotProps ?? {}" />
        </template>
      </component>

      <p
        v-if="hasDescription"
        :id="descriptionId"
        class="pxd-form-item--description text-xs text-foreground-secondary"
      >
        <slot name="description">{{ description }}</slot>
      </p>

      <div
        v-if="showMessage && visibleErrors.length"
        :id="errorId"
        class="pxd-form-item--error text-xs text-red-900"
        role="alert"
      >
        <slot name="error" :error="error" :errors="visibleErrors">
          <span v-if="error">{{ error }}</span>
        </slot>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-form-item[data-label-position='left'],
.pxd-form-item[data-label-position='right'] {
  display: grid;
  align-items: start;
  grid-template-columns: var(--form-label-width, 8rem) minmax(0, 1fr);
  column-gap: 0.75rem;
}

.pxd-form-item[data-label-position='left'] .pxd-form-item--head,
.pxd-form-item[data-label-position='right'] .pxd-form-item--head,
.pxd-form-item[data-label-position='left'] .pxd-form-item--body,
.pxd-form-item[data-label-position='right'] .pxd-form-item--body {
  grid-row: 1;
}

.pxd-form-item[data-label-position='left'] .pxd-form-item--head {
  grid-column: 1;
}

.pxd-form-item[data-label-position='left'] .pxd-form-item--body {
  grid-column: 2;
}

.pxd-form-item[data-label-position='right'] {
  grid-template-columns: minmax(0, 1fr) var(--form-label-width, 8rem);
}

.pxd-form-item[data-label-position='right'] .pxd-form-item--head {
  justify-content: flex-end;
  grid-column: 2;
}

.pxd-form-item[data-label-position='right'] .pxd-form-item--body {
  grid-column: 1;
}

.pxd-form-item[data-label-position='inline'] {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.pxd-form-item[data-label-position='inline'] .pxd-form-item--body {
  flex: 1;
}
</style>
