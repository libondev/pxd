import type { FormError } from '../../src/types/shared/form'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, reactive } from 'vue'
import { createAgent } from '../../src/agent'
import FormItem from '../../src/components/form-item/index.vue'
import Form from '../../src/components/form/index.vue'
import Input from '../../src/components/input/index.vue'

const mounted: { unmount: () => void }[] = []

const track = <T extends { unmount: () => void }>(wrapper: T) => {
  mounted.push(wrapper)

  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
})

const find = <T extends { component: string }>(entries: T[], component: string) =>
  entries.find((entry) => entry.component === component)!

function mountForm(
  validate: () => FormError[],
  options: { model?: Record<string, any>; attrs?: Record<string, unknown>; pending?: boolean } = {},
) {
  const model = options.model ?? reactive({ email: '' })

  const wrapper = track(
    mount(
      defineComponent({
        setup: () => () =>
          h(
            Form,
            {
              model,
              validate,
              pending: options.pending,
              ...options.attrs,
            },
            {
              default: () =>
                h(
                  FormItem,
                  { name: 'email', label: 'Email' },
                  {
                    default: () =>
                      h(Input, {
                        modelValue: model.email,
                        'onUpdate:modelValue': (value: unknown) => {
                          model.email = String(value)
                        },
                      }),
                  },
                ),
            },
          ),
      }),
    ),
  )

  return { wrapper, model }
}

describe('agent form', () => {
  it('should expose validity state and actions without values', () => {
    mountForm(() => [])

    const entry = find(createAgent().snapshot(), 'form')

    expect(entry).toMatchObject({
      component: 'form',
      valid: true,
      dirty: false,
      submitted: false,
      errorCount: 0,
      invalidFields: [],
      actions: ['validate', 'submit'],
    })
    expect(entry).not.toHaveProperty('values')
  })

  it('should report a failed submit through state, not values', async () => {
    mountForm(() => [{ name: 'email', message: 'Required' }])

    const agent = createAgent()
    const entry = find(agent.snapshot(), 'form')
    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'submit' }],
    })

    expect(result.ok).toBe(true)
    expect(result.results[0].result).toMatchObject({
      valid: false,
      errorCount: 1,
      invalidFields: ['email'],
    })
    expect(find(agent.snapshot(), 'form')).toMatchObject({
      valid: false,
      submitted: true,
      errorCount: 1,
      invalidFields: ['email'],
    })
  })

  it('should return only a validity summary on a valid submit', async () => {
    mountForm(() => [], { model: reactive({ email: 'a@b.c' }) })

    const agent = createAgent()
    const entry = find(agent.snapshot(), 'form')
    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'submit' }],
    })

    expect(result.results[0].result).toEqual({
      valid: true,
      errorCount: 0,
      invalidFields: [],
    })
  })

  it('should validate through the agent', async () => {
    mountForm(() => [{ name: 'email', message: 'Required' }])

    const agent = createAgent()
    const entry = find(agent.snapshot(), 'form')
    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'validate' }],
    })

    expect(result.results[0].result).toBe(false)
    expect(find(agent.snapshot(), 'form')).toMatchObject({ errorCount: 1 })
  })

  it('should require a person for a marked submit', async () => {
    mountForm(() => [], {
      model: reactive({ email: 'a@b.c' }),
      attrs: { 'data-agent-confirm': 'Submit this form' },
    })

    const agent = createAgent()
    const entry = find(agent.snapshot(), 'form')

    expect(entry.confirm).toBe('Submit this form')

    const refused = await agent.act({
      steps: [{ ref: entry.ref, action: 'submit' }],
    })

    expect(refused.ok).toBe(false)
    expect(refused.error?.message).toContain('Needs a person: Submit this form')

    const allowed = createAgent({ allow: () => true })
    const result = await allowed.act({
      steps: [{ ref: entry.ref, action: 'submit' }],
    })

    expect(result.ok).toBe(true)
  })

  it('should report an app-owned save as pending', () => {
    mountForm(() => [], { pending: true })

    expect(find(createAgent().snapshot(), 'form')).toMatchObject({ pending: true })
  })

  it('should keep its own state visible when the first field is a password', () => {
    const model = reactive({ password: '' })

    track(
      mount(
        defineComponent({
          setup: () => () =>
            h(
              Form,
              { model },
              {
                default: () =>
                  h(
                    FormItem,
                    { name: 'password', label: 'Password' },
                    {
                      default: () =>
                        h(Input, {
                          modelValue: model.password,
                          password: true,
                          'onUpdate:modelValue': (value: unknown) => {
                            model.password = String(value)
                          },
                        }),
                    },
                  ),
              },
            ),
        }),
      ),
    )

    const snapshot = createAgent().snapshot()

    expect(find(snapshot, 'form')).toMatchObject({
      valid: true,
      dirty: false,
      errorCount: 0,
    })
    expect(snapshot.find((entry) => entry.component === 'input')?.value).toBe('[redacted]')
  })
})
