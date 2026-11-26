import type { FormError } from '../../src/types/shared/form'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import CheckboxGroup from '../../src/components/checkbox-group/index.vue'
import FormItem from '../../src/components/form-item/index.vue'
import Form from '../../src/components/form/index.vue'
import Input from '../../src/components/input/index.vue'
import Select from '../../src/components/select/index.vue'
import Switch from '../../src/components/switch/index.vue'

const mounted: { unmount: () => void }[] = []

const track = <T extends { unmount: () => void }>(wrapper: T) => {
  mounted.push(wrapper)

  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
})

const update = (target: Record<string, any>, key: string) => (value: unknown) => {
  target[key] = String(value)
}

describe('form scenarios', () => {
  it('submits a login form, shows a server error and resets it', async () => {
    const model = reactive({ email: 'a@b.c', password: 'secret' })
    const formRef = ref()
    const submitted = ref<unknown>()

    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(
              Form,
              {
                model,
                ref: formRef,
                validate: () => [],
                onSubmit: (payload: unknown) => {
                  submitted.value = payload
                },
              },
              {
                default: () => [
                  h(
                    FormItem,
                    { name: 'email', label: 'Email', required: true },
                    {
                      default: () =>
                        h(Input, {
                          modelValue: model.email,
                          inputAttrs: { autocomplete: 'email' },
                          'onUpdate:modelValue': update(model, 'email'),
                        }),
                    },
                  ),
                  h(
                    FormItem,
                    { name: 'password', label: 'Password', required: true },
                    {
                      default: () =>
                        h(Input, {
                          modelValue: model.password,
                          password: true,
                          'onUpdate:modelValue': update(model, 'password'),
                        }),
                    },
                  ),
                ],
              },
            ),
        }),
      ),
    )

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(submitted.value).toMatchObject({
      data: { email: 'a@b.c', password: 'secret' },
    })

    ;(formRef.value as any).setErrors([{ name: 'password', message: 'Incorrect' }])
    await nextTick()

    expect(wrapper.text()).toContain('Incorrect')
    expect(wrapper.find('input[type="password"]').attributes('aria-invalid')).toBe('true')

    ;(formRef.value as any).reset()
    await nextTick()

    expect(model.password).toBe('secret')
    expect(wrapper.text()).not.toContain('Incorrect')
  })

  it('edits a settings form and resets every control', async () => {
    const model = reactive({
      name: 'Jane',
      role: 'user',
      notifications: 'on',
      channels: ['email'],
    })
    const formRef = ref()
    const roles = [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ]
    const notifications = [
      { label: 'Off', value: 'off' },
      { label: 'On', value: 'on' },
    ]
    const channels = [
      { label: 'Email', value: 'email' },
      { label: 'SMS', value: 'sms' },
    ]

    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(
              Form,
              { model, ref: formRef },
              {
                default: () => [
                  h(
                    FormItem,
                    { name: 'name', label: 'Name' },
                    {
                      default: () =>
                        h(Input, {
                          modelValue: model.name,
                          'onUpdate:modelValue': update(model, 'name'),
                        }),
                    },
                  ),
                  h(
                    FormItem,
                    { name: 'role', label: 'Role' },
                    {
                      default: () =>
                        h(Select, {
                          modelValue: model.role,
                          options: roles,
                          'onUpdate:model-value': (value: unknown) => {
                            model.role = String(value)
                          },
                        }),
                    },
                  ),
                  h(
                    FormItem,
                    { name: 'notifications', label: 'Notifications' },
                    {
                      default: () =>
                        h(Switch, {
                          modelValue: model.notifications,
                          options: notifications,
                          'onUpdate:model-value': (value: unknown) => {
                            model.notifications = String(value)
                          },
                        }),
                    },
                  ),
                  h(
                    FormItem,
                    { name: 'channels', label: 'Channels' },
                    {
                      default: () =>
                        h(CheckboxGroup, {
                          modelValue: model.channels,
                          options: channels,
                          'onUpdate:model-value': (value: unknown) => {
                            model.channels = value as string[]
                          },
                        }),
                    },
                  ),
                ],
              },
            ),
        }),
      ),
    )

    model.name = 'John'
    model.role = 'admin'
    model.notifications = 'off'
    model.channels = ['email', 'sms']
    await nextTick()

    expect(wrapper.find('input').element.value).toBe('John')

    ;(formRef.value as any).reset()
    await nextTick()

    expect(model).toMatchObject({
      name: 'Jane',
      role: 'user',
      notifications: 'on',
      channels: ['email'],
    })
    expect(wrapper.find('input').element.value).toBe('Jane')
  })

  it('adds and removes array rows without keeping stale errors', async () => {
    const model = reactive({ contacts: [{ email: '' }] })

    const validate = (values: Record<string, any>): FormError[] =>
      (values.contacts as Array<{ email: string }>).flatMap((contact, index) =>
        contact.email ? [] : [{ name: `contacts.${index}.email`, message: 'Email is required' }],
      )

    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(
              Form,
              { model, validate },
              {
                default: () =>
                  model.contacts.map((contact, index) =>
                    h(
                      FormItem,
                      {
                        key: index,
                        name: `contacts.${index}.email`,
                        label: `Contact ${index + 1}`,
                      },
                      {
                        default: () =>
                          h(Input, {
                            modelValue: contact.email,
                            'onUpdate:modelValue': (value: unknown) => {
                              contact.email = String(value)
                            },
                          }),
                      },
                    ),
                  ),
              },
            ),
        }),
      ),
    )

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.findAll('.pxd-form-item--error')).toHaveLength(1)
    expect(wrapper.text()).toContain('Email is required')

    model.contacts.push({ email: '' })
    await nextTick()
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.findAll('.pxd-form-item--error')).toHaveLength(2)

    model.contacts.shift()
    await nextTick()
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.findAll('.pxd-form-item--error')).toHaveLength(1)
    expect(wrapper.text()).toContain('Contact 1')
  })
})
