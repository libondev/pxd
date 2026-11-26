import type { Ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import PFormItem from '../../src/components/form-item/index.vue'
import PForm from '../../src/components/form/index.vue'
import PInput from '../../src/components/input/index.vue'

function formWith(
  slot: () => unknown,
  props: Record<string, unknown>,
  model: Record<string, any>,
  formRef?: Ref,
) {
  return mount(
    defineComponent({
      setup: () => () => h(PForm, { model, ref: formRef, ...props }, { default: slot }),
    }),
  )
}

function emailItem(model: { email: string }) {
  return () =>
    h(
      PFormItem,
      { name: 'email', label: 'Email' },
      {
        default: () =>
          h(PInput, {
            modelValue: model.email,
            'onUpdate:modelValue': (value: unknown) => {
              model.email = String(value)
            },
          }),
      },
    )
}

function submittedPayload(wrapper: ReturnType<typeof mount>) {
  return wrapper
    .findComponent(PForm)
    .emitted('submit')
    ?.find(([payload]) => payload != null && typeof payload === 'object' && 'data' in payload)?.[0]
}

describe('form', () => {
  it('emits invalid and blocks submit when validation fails', async () => {
    const model = reactive({ email: '' })
    const wrapper = formWith(
      emailItem(model),
      { validate: () => [{ name: 'email', message: 'Required' }] },
      model,
    )

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(submittedPayload(wrapper)).toBeUndefined()
    expect(wrapper.findComponent(PForm).emitted('invalid')?.[0]?.[0]).toMatchObject({
      first: { name: 'email', message: 'Required' },
    })

    wrapper.unmount()
  })

  it('emits submit with the model when validation passes', async () => {
    const model = reactive({ email: 'a@b.c' })
    const wrapper = formWith(emailItem(model), { validate: () => [] }, model)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(submittedPayload(wrapper)).toMatchObject({
      data: { email: 'a@b.c' },
    })

    wrapper.unmount()
  })

  it('emits validate after each run', async () => {
    const model = reactive({ email: '' })
    const wrapper = formWith(
      emailItem(model),
      { validate: () => [{ name: 'email', message: 'Required' }] },
      model,
    )

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.findComponent(PForm).emitted('validate')?.at(-1)?.[0]).toMatchObject({
      valid: false,
    })

    wrapper.unmount()
  })

  it('renders root and unmatched errors in the error region', async () => {
    const model = reactive({ email: '' })
    const formRef = ref()
    const wrapper = formWith(() => null, {}, model, formRef)

    ;(formRef.value as any).setErrors([{ name: 'unknown', message: 'Nope' }])
    await nextTick()

    expect(wrapper.find('[data-form-error]').text()).toContain('Nope')

    wrapper.unmount()
  })

  it('derives item ids from the form id', () => {
    const model = reactive({ email: '' })
    const wrapper = formWith(emailItem(model), { id: 'checkout' }, model)

    expect(wrapper.find('input').attributes('id')).toBe('checkout-email')

    wrapper.unmount()
  })

  it('emits reset when the exposed reset runs', () => {
    const model = reactive({ email: '' })
    const formRef = ref()
    const wrapper = formWith(() => null, {}, model, formRef)

    ;(formRef.value as any).reset()

    expect(wrapper.findComponent(PForm).emitted('reset')).toHaveLength(1)

    wrapper.unmount()
  })

  it('emits submit once for concurrent submits', async () => {
    const model = reactive({ email: 'a@b.c' })
    const wrapper = formWith(emailItem(model), { validate: () => [] }, model)
    const form = wrapper.find('form')

    await Promise.all([form.trigger('submit'), form.trigger('submit')])
    await flushPromises()

    expect(wrapper.findComponent(PForm).emitted('submit')).toHaveLength(1)

    wrapper.unmount()
  })
})
