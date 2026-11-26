import type { StandardSchema } from '../../src/types/shared/form'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick, reactive } from 'vue'
import { useForm } from '../../src/composables/use-form'
import { runWithScope } from '../helpers/setup'

const schema: StandardSchema = {
  '~standard': {
    version: 1,
    vendor: 'test',
    validate: (value) => {
      const model = value as { email?: string }

      return model.email ? { value: model } : { issues: [{ message: 'Required', path: ['email'] }] }
    },
  },
}

describe('use-form', () => {
  it('validates the model and groups errors by path', async () => {
    const model = reactive({ email: '' })
    const { result: form, stop } = runWithScope(() => useForm({ model, schema }))

    await expect(form.validate()).resolves.toBe(false)
    expect(form.getFieldErrors('email')).toEqual(['Required'])

    model.email = 'a@b.c'

    await expect(form.validate()).resolves.toBe(true)
    expect(form.errors.value).toEqual([])

    stop()
  })

  it('returns the schema output on submit', async () => {
    const model = reactive({ email: 'a@b.c' })
    const { result: form, stop } = runWithScope(() => useForm({ model, schema }))

    const result = await form.submit()

    expect(result.valid).toBe(true)
    expect(result.data).toEqual({ email: 'a@b.c' })
    expect(form.isSubmitted.value).toBe(true)

    stop()
  })

  it('resets to the captured initial values without revalidating', async () => {
    const model = reactive({ email: '' })
    const { result: form, stop } = runWithScope(() => useForm({ model, schema }))

    model.email = 'changed'
    await nextTick()

    form.reset()
    await nextTick()

    expect(model.email).toBe('')
    expect(form.errors.value).toEqual([])
    expect(form.isDirty.value).toBe(false)

    stop()
  })

  it('re-snapshots values for reset after async data loads', async () => {
    const model = reactive({ email: '' })
    const { result: form, stop } = runWithScope(() => useForm({ model }))

    model.email = 'loaded'
    form.setInitialValues()
    model.email = 'edited'

    form.reset()
    await nextTick()

    expect(model.email).toBe('loaded')

    stop()
  })

  it('merges server errors by path and clears them', () => {
    const model = reactive({ email: '' })
    const { result: form, stop } = runWithScope(() => useForm({ model }))

    form.setErrors([{ name: ['tags', 0], message: 'Bad tag' }])

    expect(form.getFieldErrors('tags.0')).toEqual(['Bad tag'])

    form.clearErrors('tags.0')

    expect(form.getFieldErrors('tags.0')).toEqual([])

    stop()
  })

  it('tracks dirty writes until reset', async () => {
    const model = reactive({ email: '' })
    const { result: form, stop } = runWithScope(() => useForm({ model }))

    model.email = 'x'
    await nextTick()

    expect(form.isDirty.value).toBe(true)

    form.reset()
    await nextTick()

    expect(form.isDirty.value).toBe(false)

    stop()
  })

  it('keeps the newest result when validation runs resolve out of order', async () => {
    const model = reactive({ email: '' })
    const resolvers: Array<(result: { value?: unknown; issues?: unknown[] }) => void> = []
    const schema: StandardSchema = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: () =>
          new Promise((resolve) => {
            resolvers.push(resolve as (result: { value?: unknown; issues?: unknown[] }) => void)
          }),
      },
    }
    const { result: form, stop } = runWithScope(() => useForm({ model, schema }))

    const first = form.validateField('email')
    const second = form.validateField('email')

    resolvers[1]({ issues: [{ message: 'Second', path: ['email'] }] })
    await expect(second).resolves.toBe(false)
    expect(form.getFieldErrors('email')).toEqual(['Second'])

    resolvers[0]({ value: { email: 'first' } })
    await first

    expect(form.getFieldErrors('email')).toEqual(['Second'])

    stop()
  })

  it('discards a validation that resolves after reset', async () => {
    const model = reactive({ email: '' })
    let resolveValidation!: (result: { issues?: unknown[] }) => void
    const schema: StandardSchema = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: () =>
          new Promise((resolve) => {
            resolveValidation = resolve as typeof resolveValidation
          }),
      },
    }
    const { result: form, stop } = runWithScope(() => useForm({ model, schema }))

    const pending = form.validate()

    form.reset()
    resolveValidation({ issues: [{ message: 'Stale', path: ['email'] }] })
    await pending

    expect(form.errors.value).toEqual([])

    stop()
  })

  it('keeps server errors when an older validation resolves', async () => {
    const model = reactive({ email: '' })
    let resolveValidation!: (result: { issues?: unknown[] }) => void
    const schema: StandardSchema = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: () =>
          new Promise((resolve) => {
            resolveValidation = resolve as typeof resolveValidation
          }),
      },
    }
    const { result: form, stop } = runWithScope(() => useForm({ model, schema }))

    const pending = form.validate()

    form.setErrors([{ name: 'email', message: 'Server' }])
    resolveValidation({ issues: [{ message: 'Stale', path: ['email'] }] })
    await pending

    expect(form.getFieldErrors('email')).toEqual(['Server'])

    stop()
  })

  it('runs the form schema even when a field has rules', async () => {
    const model = reactive({ email: '' })
    const permissive: StandardSchema = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: (value) => ({ value }),
      },
    }
    const { result: form, stop } = runWithScope(() => useForm({ model, schema }))

    form.registerItem({ name: 'email', rules: permissive })

    await expect(form.validateField('email')).resolves.toBe(false)
    expect(form.getFieldErrors('email')).toEqual(['Required'])

    stop()
  })

  it('returns the same promise for concurrent submits', async () => {
    const model = reactive({ email: '' })
    const { result: form, stop } = runWithScope(() => useForm({ model }))

    const first = form.submit()
    const second = form.submit()

    expect(second).toBe(first)

    await first

    stop()
  })

  it('does not turn dirty when setInitialValues follows a write', async () => {
    const model = reactive({ email: '' })
    const { result: form, stop } = runWithScope(() => useForm({ model }))

    model.email = 'loaded'
    form.setInitialValues()
    await nextTick()

    expect(form.isDirty.value).toBe(false)

    stop()
  })
})
