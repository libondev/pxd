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

function mountLogin() {
  const model = reactive({ email: '', password: '' })

  const wrapper = track(
    mount(
      defineComponent({
        setup: () => () =>
          h(
            Form,
            { model, id: 'login' },
            {
              default: () => [
                h(
                  FormItem,
                  { name: 'email', label: 'Email', description: 'Work email', required: true },
                  {
                    default: () =>
                      h(Input, {
                        modelValue: model.email,
                        'onUpdate:modelValue': update(model, 'email'),
                        inputAttrs: { autocomplete: 'email' },
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

  return wrapper
}

describe('form accessibility', () => {
  it('wires labels, descriptions and required state to the control', () => {
    const wrapper = mountLogin()
    const item = wrapper.findAll('[data-form-item]')[0]
    const label = item.find('label')
    const input = item.find('input')
    const description = item.find('p')
    const describedBy = input.attributes('aria-describedby')!

    expect(label.attributes('for')).toBe(input.attributes('id'))
    expect(item.attributes('role')).toBe('group')
    expect(item.attributes('aria-labelledby')).toBe(label.attributes('id'))
    expect(input.attributes('required')).toBe('')
    expect(describedBy.split(' ')).toContain(description.attributes('id'))
  })

  it('exposes the error as an alert and describes it only while present', async () => {
    const formRef = ref()
    const model = reactive({ password: '' })

    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(
              Form,
              { model, ref: formRef },
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
                          'onUpdate:modelValue': update(model, 'password'),
                        }),
                    },
                  ),
              },
            ),
        }),
      ),
    )

    ;(formRef.value as any).setErrors([{ name: 'password', message: 'Incorrect' }])
    await nextTick()

    const input = wrapper.find('input')
    const error = wrapper.find('.pxd-form-item--error')

    expect(input.attributes('aria-invalid')).toBe('true')
    expect(error.attributes('role')).toBe('alert')
    expect(input.attributes('aria-describedby')).toContain(error.attributes('id'))

    ;(formRef.value as any).clearErrors()
    await nextTick()

    expect(wrapper.find('.pxd-form-item--error').exists()).toBe(false)
    expect(input.attributes('aria-describedby')).toBeUndefined()
  })

  it('names a select trigger and group controls through the item label', () => {
    const model = reactive({ role: 'user', channels: ['email'], notifications: 'on' })
    const roles = [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ]
    const channels = [
      { label: 'Email', value: 'email' },
      { label: 'SMS', value: 'sms' },
    ]
    const notifications = [
      { label: 'Off', value: 'off' },
      { label: 'On', value: 'on' },
    ]

    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(
              Form,
              { model },
              {
                default: () => [
                  h(
                    FormItem,
                    { name: 'role', label: 'Role', required: true },
                    { default: () => h(Select, { modelValue: model.role, options: roles }) },
                  ),
                  h(
                    FormItem,
                    { name: 'channels', label: 'Channels', description: 'Delivery' },
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
                  h(
                    FormItem,
                    { name: 'notifications', label: 'Notifications', required: true },
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
                ],
              },
            ),
        }),
      ),
    )

    const items = wrapper.findAll('[data-form-item]')
    const roleItem = items[0]
    const roleLabel = roleItem.find('label')
    const trigger = roleItem.find('.pxd-button')
    const labelledBy = trigger.attributes('aria-labelledby')!.split(' ')

    expect(trigger.attributes('aria-required')).toBe('true')
    expect(labelledBy[0]).toBe(roleLabel.attributes('id'))
    expect(wrapper.find(`[id="${labelledBy[1]}"]`).text()).toContain('User')

    const channelsItem = items[1]
    const channelsLabel = channelsItem.find('label')
    const group = channelsItem.find('[data-checkbox-group]')

    expect(group.attributes('aria-labelledby')).toBe(channelsLabel.attributes('id'))
    expect(group.attributes('aria-describedby')).toBe(channelsItem.find('p').attributes('id'))

    const switchItem = items[2]
    const switchLabel = switchItem.find('label')
    const toggle = switchItem.find('[data-switch]')

    expect(toggle.attributes('aria-labelledby')).toBe(switchLabel.attributes('id'))
    expect(toggle.attributes('aria-required')).toBe('true')
  })

  it('focuses the first invalid control on submit', async () => {
    const model = reactive({ email: '', name: '' })

    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(
              Form,
              {
                model,
                validate: () => [{ name: 'email', message: 'Required' }],
              },
              {
                default: () => [
                  h(
                    FormItem,
                    { name: 'email', label: 'Email' },
                    {
                      default: () =>
                        h(Input, {
                          modelValue: model.email,
                          'onUpdate:modelValue': update(model, 'email'),
                        }),
                    },
                  ),
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
                ],
              },
            ),
        }),
        { attachTo: document.body },
      ),
    )

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await nextTick()

    expect(document.activeElement).toBe(wrapper.findAll('input')[0].element)
  })

  it('marks the form busy while an app-owned save is pending', () => {
    const model = reactive({ email: '' })
    const wrapper = track(
      mount(Form, {
        props: { model, pending: true },
      }),
    )

    expect(wrapper.find('form').attributes('aria-busy')).toBe('true')
  })
})
