import type {
  FormError,
  FormItemRegistration,
  FormPath,
  FormValidateOn,
  FormValidatePayload,
  StandardSchemaIssue,
  UseFormOptions,
  UseFormReturn,
} from '../types/shared/form'
import { computed, nextTick, onScopeDispose, ref, shallowRef, toRaw, toValue, watch } from 'vue'
import { formatPath, getPath, matchesPath, setPath } from '../utils/_internal/form-path.js'

const DEFAULT_VALIDATE_ON: FormValidateOn[] = ['blur', 'change']
const DEFAULT_DEBOUNCE = 300

function clone<T>(value: T): T {
  return structuredClone(toRaw(value))
}

function issuesToErrors(issues: readonly StandardSchemaIssue[]): FormError[] {
  return issues.map((issue) => ({
    name: (issue.path ?? [])
      .map((segment) => (typeof segment === 'object' ? segment.key : segment))
      .join('.'),
    message: issue.message,
  }))
}

function dedupe(list: FormError[]): FormError[] {
  const seen = new Set<string>()

  return list.filter((error) => {
    const key = `${formatPath(error.name)}\u0000${error.message}`

    if (seen.has(key)) {
      return false
    }

    seen.add(key)

    return true
  })
}

export function useForm<M extends Record<string, any>, Output = M>(
  options: UseFormOptions<M, Output>,
): UseFormReturn<M, Output> {
  const validateOn = options.validateOn ?? DEFAULT_VALIDATE_ON
  const debounce = options.debounce ?? DEFAULT_DEBOUNCE

  const errors = ref<FormError[]>([])
  const isValidating = ref(false)
  const isDirty = ref(false)
  const isSubmitted = ref(false)
  const output = shallowRef<Output>()
  const hasOutput = ref(false)
  const touched = ref<string[]>([])
  const itemNames = ref<string[]>([])

  const items = new Map<string, FormItemRegistration>()
  const lastRunByName = new Map<string, number>()
  let initial = clone(
    options.initialValues == null ? toValue(options.model) : toValue(options.initialValues),
  )
  let sequence = 0
  let epoch = 0
  let outputRun = 0
  let pending = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let isResetting = false
  let isSettingInitial = false
  let submitPromise: Promise<{ valid: boolean; data?: Output; errors: FormError[] }> | undefined

  const fieldErrors = computed(() => {
    const map: Record<string, string[]> = {}

    for (const error of errors.value) {
      const key = formatPath(error.name)

      if (!map[key]) {
        map[key] = []
      }

      map[key].push(error.message)
    }

    return map
  })

  const isValid = computed(() => errors.value.length === 0)
  const unmatchedErrors = computed(() =>
    errors.value.filter((error) => !itemNames.value.includes(formatPath(error.name))),
  )

  function notifyValidate(payload: FormValidatePayload): void {
    options.onValidate?.(payload)
  }

  function clearTimer(): void {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  function schedule(): void {
    clearTimer()
    timer = setTimeout(() => {
      void validate()
    }, debounce)
  }

  function markTouched(name: FormPath): void {
    const key = formatPath(name)

    if (!touched.value.includes(key)) {
      touched.value = [...touched.value, key]
    }
  }

  function isTouched(name: FormPath): boolean {
    return touched.value.includes(formatPath(name))
  }

  function getFieldErrors(name: FormPath): readonly string[] {
    return fieldErrors.value[formatPath(name)] ?? []
  }

  function registerItem(item: FormItemRegistration): void {
    const key = formatPath(item.name)

    items.set(key, item)

    if (!itemNames.value.includes(key)) {
      itemNames.value = [...itemNames.value, key]
    }
  }

  function unregisterItem(name: FormPath): void {
    const key = formatPath(name)

    items.delete(key)
    itemNames.value = itemNames.value.filter((entry) => entry !== key)
    clearErrors(key)
  }

  function applyErrors(
    next: FormError[],
    runId: number,
    names: string[] | undefined,
    runEpoch: number,
  ): void {
    if (runEpoch !== epoch) {
      return
    }

    const scope = new Set(
      names ?? [
        ...items.keys(),
        ...lastRunByName.keys(),
        ...next.map((error) => formatPath(error.name)),
      ],
    )
    const owned = new Set<string>()

    for (const key of scope) {
      if (runId >= (lastRunByName.get(key) ?? 0)) {
        lastRunByName.set(key, runId)
        owned.add(key)
      }
    }

    const fresh = new Map<string, FormError[]>()

    for (const error of next) {
      const key = formatPath(error.name)

      if (!owned.has(key)) {
        continue
      }

      const list = fresh.get(key) ?? []
      list.push(error)
      fresh.set(key, list)
    }

    errors.value = [
      ...errors.value.filter((error) => !owned.has(formatPath(error.name))),
      ...[...fresh.values()].flat(),
    ]
  }

  async function runSchema(target: FormError[], runId: number, runEpoch: number): Promise<void> {
    const schema = options.schema == null ? undefined : toValue(options.schema)

    if (!schema) {
      return
    }

    const result = await schema['~standard'].validate(toValue(options.model))

    if (result.issues) {
      target.push(...issuesToErrors(result.issues))

      return
    }

    if (runEpoch === epoch && runId >= outputRun) {
      output.value = result.value
      hasOutput.value = true
      outputRun = runId
    }
  }

  async function runCustom(target: FormError[]): Promise<void> {
    if (!options.validate) {
      return
    }

    target.push(...(await options.validate(toValue(options.model))))
  }

  async function runFieldRules(name: string, target: FormError[]): Promise<void> {
    const registration = items.get(name)
    const schema = registration?.rules == null ? undefined : toValue(registration.rules)

    if (!schema) {
      return
    }

    const result = await schema['~standard'].validate(getPath(toValue(options.model), name))

    if (result.issues) {
      target.push(...issuesToErrors(result.issues).map((error) => ({ ...error, name })))
    }
  }

  async function validateAll(): Promise<boolean> {
    const runId = ++sequence
    const runEpoch = epoch
    pending++
    isValidating.value = true

    try {
      const next: FormError[] = []

      await runSchema(next, runId, runEpoch)
      await runCustom(next)

      for (const [name, registration] of items) {
        if (registration.rules) {
          await runFieldRules(name, next)
        }
      }

      applyErrors(dedupe(next), runId, undefined, runEpoch)

      if (runEpoch !== epoch) {
        return false
      }

      notifyValidate({ valid: errors.value.length === 0, errors: [...errors.value] })

      return errors.value.length === 0
    } finally {
      pending--
      isValidating.value = pending > 0
    }
  }

  async function validateField(name: FormPath): Promise<boolean> {
    const key = formatPath(name)
    const runId = ++sequence
    const runEpoch = epoch
    pending++
    isValidating.value = true

    try {
      const next: FormError[] = []
      const registration = items.get(key)
      const fieldSchema = registration?.rules == null ? undefined : toValue(registration.rules)

      if (fieldSchema) {
        await runFieldRules(key, next)
      }

      await runSchema(next, runId, runEpoch)
      await runCustom(next)

      const filtered = next.filter((error) => matchesPath(error.name, key))
      const scope = [key, ...filtered.map((error) => formatPath(error.name))]

      applyErrors(dedupe(filtered), runId, [...new Set(scope)], runEpoch)

      if (runEpoch !== epoch) {
        return false
      }

      const valid = errors.value.every((error) => !matchesPath(error.name, key))

      notifyValidate({ name: key, valid, errors: [...errors.value] })

      return valid
    } finally {
      pending--
      isValidating.value = pending > 0
    }
  }

  function validate(...names: FormPath[]): Promise<boolean> {
    if (!names.length) {
      return validateAll()
    }

    if (names.length === 1) {
      return validateField(names[0])
    }

    return Promise.all(names.map((name) => validateField(name))).then((results) =>
      results.every(Boolean),
    )
  }

  function submit(): Promise<{ valid: boolean; data?: Output; errors: FormError[] }> {
    if (!submitPromise) {
      submitPromise = runSubmit().finally(() => {
        submitPromise = undefined
      })
    }

    return submitPromise
  }

  async function runSubmit(): Promise<{ valid: boolean; data?: Output; errors: FormError[] }> {
    isSubmitted.value = true
    clearTimer()

    const valid = await validateAll()

    if (!valid) {
      return { valid: false, errors: [...errors.value] }
    }

    const data = hasOutput.value ? output.value : clone(toValue(options.model))

    return { valid: true, data: data as Output, errors: [] }
  }

  function reset(name?: FormPath): void {
    epoch++
    outputRun = 0
    output.value = undefined
    hasOutput.value = false
    isResetting = true

    const model = toValue(options.model)

    if (name == null) {
      const snapshot = clone(initial)

      for (const key of Object.keys(model)) {
        delete model[key]
      }

      Object.assign(model, snapshot)
      touched.value = []
      errors.value = []
      isSubmitted.value = false
      isDirty.value = false
    } else {
      const key = formatPath(name)

      setPath(model, name, clone(getPath(initial, name)))
      touched.value = touched.value.filter((entry) => !matchesPath(entry, key))
      errors.value = errors.value.filter((error) => !matchesPath(error.name, key))
    }

    void nextTick(() => {
      isResetting = false
    })
  }

  function setInitialValues(values?: Partial<M> | M): void {
    isSettingInitial = true
    initial = clone(values ?? toValue(options.model))
    isDirty.value = false

    void nextTick(() => {
      isSettingInitial = false
    })
  }

  function setErrors(next: FormError[]): void {
    epoch++
    const normalized = dedupe(next.map((error) => ({ ...error, name: formatPath(error.name) })))

    errors.value = normalized

    for (const error of normalized) {
      markTouched(error.name)
    }
  }

  function clearErrors(name?: FormPath): void {
    epoch++

    if (name == null) {
      errors.value = []

      return
    }

    const key = formatPath(name)

    errors.value = errors.value.filter((error) => !matchesPath(error.name, key))
  }

  watch(
    () => toValue(options.model),
    () => {
      if (isResetting) {
        return
      }

      isDirty.value = !isSettingInitial

      if (validateOn.includes('change')) {
        schedule()
      }
    },
    { deep: true },
  )

  watch(
    () => (options.schema == null ? undefined : toValue(options.schema)),
    () => {
      epoch++
      outputRun = 0
      errors.value = []
      output.value = undefined
      hasOutput.value = false
    },
  )

  onScopeDispose(clearTimer)

  return {
    errors,
    unmatchedErrors,
    isValidating,
    isValid,
    isDirty,
    isSubmitted,
    validate,
    validateField,
    submit,
    reset,
    setInitialValues,
    setErrors,
    clearErrors,
    getFieldErrors,
    isTouched,
    markTouched,
    registerItem,
    unregisterItem,
  }
}
