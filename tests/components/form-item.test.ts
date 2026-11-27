import type { StandardSchema } from '../../src/types/shared/form'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import PFormItem from '../../src/components/form-item/index.vue'
import PForm from '../../src/components/form/index.vue'
import PInput from '../../src/components/input/index.vue'
import PSelect from '../../src/components/select/index.vue'

const requiredSchema: StandardSchema = {
  '~standard': {
    version: 1,
    vendor: 'test',
    validate: (value) => {
      const model = value as { email?: string }

      return model.email ? { value: model } : { issues: [{ message: 'Required', path: ['email'] }] }
    },
  },
}

function mountItem(
  itemProps: Record<string, unknown>,
  model: Record<string, any> = reactive({ email: '' }),
  slot?: () => unknown,
  formProps: Record<string, unknown> = {},
) {
  return mount(
    defineComponent({
      setup: () => () =>
        h(
          PForm,
          { model, ...formProps },
          {
            default: () => h(PFormItem, itemProps, slot ? { default: slot } : undefined),
          },
        ),
    }),
  )
}

function inputSlot(model: { email: string }) {
  return () =>
    h(PInput, {
      modelValue: model.email,
      'onUpdate:modelValue': (value: unknown) => {
        model.email = String(value)
      },
    })
}

describe('form-item', () => {
  it('wires the label, description and group semantics', () => {
    const model = reactive({ email: '' })
    const wrapper = mountItem(
      { name: 'email', label: 'Email', description: 'Help text' },
      model,
      inputSlot(model),
    )
    const label = wrapper.find('label')
    const input = wrapper.find('input')
    const item = wrapper.find('[data-form-item]')

    expect(label.attributes('for')).toBe(input.attributes('id'))
    expect(item.attributes('role')).toBe('group')
    expect(item.attributes('aria-labelledby')).toBe(label.attributes('id'))
    expect(wrapper.text()).toContain('Help text')

    wrapper.unmount()
  })

  it('renders a manual error and marks the control invalid', () => {
    const model = reactive({ email: '' })
    const wrapper = mountItem(
      { label: 'Email', errorMessage: 'Bad email' },
      model,
      inputSlot(model),
    )

    expect(wrapper.text()).toContain('Bad email')
    expect(wrapper.find('[data-form-item]').attributes('data-invalid')).toBe('true')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('.pxd-form-item--error').attributes('role')).toBe('alert')

    wrapper.unmount()
  })

  it('renders no error element while the field is valid', () => {
    const model = reactive({ email: '' })
    const wrapper = mountItem({ name: 'email', label: 'Email' }, model, inputSlot(model))

    expect(wrapper.find('.pxd-form-item--error').exists()).toBe(false)
    expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined()

    wrapper.unmount()
  })

  it('validates on focusout and reveals the message', async () => {
    const model = reactive({ email: '' })
    const wrapper = mountItem({ name: 'email', label: 'Email' }, model, inputSlot(model), {
      schema: requiredSchema,
    })

    await wrapper.find('[data-form-item]').trigger('focusout')
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Required')
    expect(wrapper.find('[data-form-item]').attributes('data-invalid')).toBe('true')

    wrapper.unmount()
  })

  it('auto-renders a pxd component and binds the model', async () => {
    const model = reactive({ email: '' })
    const wrapper = mountItem({ name: 'email', label: 'Email', component: PInput }, model)

    await wrapper.find('input').setValue('auto@b.c')

    expect(model.email).toBe('auto@b.c')

    wrapper.unmount()
  })

  it('forwards component slots to the auto-rendered control', () => {
    const model = reactive({ email: '' })
    const wrapper = mountItem(
      {
        name: 'email',
        label: 'Email',
        component: PInput,
        componentSlots: {
          prefix: () => h('span', { 'data-prefix': '' }, '¥'),
        },
      },
      model,
    )

    expect(wrapper.find('[data-prefix]').text()).toBe('¥')

    wrapper.unmount()
  })

  it('passes scoped slot props to a component slot', () => {
    const model = reactive({ email: '' })
    const Control = defineComponent({
      setup:
        (_, { slots }) =>
        () =>
          h('div', [slots.label?.({ value: 'scoped' })]),
    })
    const wrapper = mountItem(
      {
        name: 'email',
        label: 'Email',
        component: Control,
        componentSlots: {
          label: (slotProps?: Record<string, unknown>) => h('span', String(slotProps?.value)),
        },
      },
      model,
    )

    expect(wrapper.text()).toContain('scoped')

    wrapper.unmount()
  })

  it('auto-renders a native element and binds the model', async () => {
    const model = reactive({ email: '' })
    const wrapper = mountItem({ name: 'email', label: 'Email', component: 'input' }, model)

    await wrapper.find('input').setValue('native@b.c')

    expect(model.email).toBe('native@b.c')

    wrapper.unmount()
  })

  it('creates nested arrays for an array path', async () => {
    const model = reactive<Record<string, any>>({})
    const wrapper = mountItem(
      { name: 'contacts.0.email', label: 'Email', component: 'input' },
      model,
    )

    await wrapper.find('input').setValue('array@b.c')

    expect(model.contacts[0].email).toBe('array@b.c')

    wrapper.unmount()
  })

  it('binds a native checkbox', async () => {
    const model = reactive({ agree: false })
    const wrapper = mountItem(
      {
        name: 'agree',
        label: 'Agree',
        component: 'input',
        componentProps: { type: 'checkbox' },
      },
      model,
    )
    const checkbox = wrapper.find('input')

    await checkbox.setValue(true)
    expect(model.agree).toBe(true)

    await checkbox.setValue(false)
    expect(model.agree).toBe(false)

    wrapper.unmount()
  })

  it('matches errors with errorPattern without a name', async () => {
    const model = reactive({ tags: [''] })
    const formRef = ref()
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            PForm,
            { model, ref: formRef },
            {
              default: () =>
                h(
                  PFormItem,
                  { label: 'Tags', errorPattern: /^tags\./ },
                  { default: () => h('div') },
                ),
            },
          ),
      }),
    )

    ;(formRef.value as any).setErrors([{ name: 'tags.0', message: 'Tag 0' }])
    await nextTick()

    expect(wrapper.find('.pxd-form-item--error').text()).toContain('Tag 0')

    wrapper.unmount()
  })

  it('names a select trigger with its label and value', () => {
    const model = reactive({ role: 'user' })
    const wrapper = mountItem({ name: 'role', label: 'Role' }, model, () =>
      h(PSelect, {
        modelValue: model.role,
        options: [{ label: 'User', value: 'user' }],
      }),
    )
    const labelledby = wrapper.find('.pxd-button').attributes('aria-labelledby')

    expect(labelledby).toBeTruthy()

    const ids = labelledby!.split(' ')

    expect(wrapper.find(`[id="${ids[0]}"]`).text()).toContain('Role')
    expect(wrapper.find(`[id="${ids[1]}"]`).text()).toContain('User')

    wrapper.unmount()
  })

  it('matches array item errors with errorPattern', async () => {
    const model = reactive({ tags: [''] })
    const formRef = ref()
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            PForm,
            { model, ref: formRef },
            {
              default: () =>
                h(
                  PFormItem,
                  { name: 'tags', label: 'Tags', errorPattern: /^tags\./ },
                  { default: () => h('div') },
                ),
            },
          ),
      }),
    )

    ;(formRef.value as any).setErrors([
      { name: 'tags.0', message: 'Tag 0' },
      { name: 'tags.1', message: 'Tag 1' },
    ])
    await nextTick()

    expect(wrapper.find('.pxd-form-item--error').text()).toContain('Tag 0')

    wrapper.unmount()
  })

  it('works without a form and still marks the control', () => {
    const model = reactive({ email: '' })
    const wrapper = mount(PFormItem, {
      props: { label: 'Email', errorMessage: 'Bad email' },
      slots: { default: inputSlot(model) },
    })

    expect(wrapper.text()).toContain('Bad email')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')

    wrapper.unmount()
  })
})
