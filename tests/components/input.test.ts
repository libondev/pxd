import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Input from '../../src/components/input/index.vue'

describe('input', () => {
  it('renders properly', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'test',
      },
    })

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)

    expect(input.element.value).toBe('test')

    await input.setValue('test2')

    await wrapper.vm.$nextTick()

    expect(input.element.value).toBe('test2')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()

    wrapper.unmount()
  })

  it('should type is password', async () => {
    const wrapper = mount(Input, {
      props: {
        password: true,
      },
    })

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)

    expect(input.element.type).toBe('password')

    wrapper.unmount()
  })

  it('should display error message', async () => {
    const wrapper = mount(Input, {
      props: {
        error: 'error message',
      },
    })

    const error = wrapper.find('.pxd-error')
    expect(error.exists()).toBe(true)

    expect(error.text()).toBe('error message')

    wrapper.unmount()
  })

  it('should display prefix and suffix', async () => {
    const wrapper = mount(Input, {
      slots: {
        prefix: 'prefix',
        suffix: 'suffix',
      },
    })

    const prefix = wrapper.find('.pxd-input--prefix')
    expect(prefix.exists()).toBe(true)

    expect(prefix.text()).toBe('prefix')

    const suffix = wrapper.find('.pxd-input--suffix')
    expect(suffix.exists()).toBe(true)

    expect(suffix.text()).toBe('suffix')

    wrapper.unmount()
  })

  it('should display label', async () => {
    const wrapper = mount(Input, {
      props: {
        label: 'label',
      },
    })

    const label = wrapper.find('.pxd-form--label')
    expect(label.exists()).toBe(true)

    expect(label.text()).toBe('label')

    wrapper.unmount()
  })
})
