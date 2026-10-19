import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
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

    await wrapper.setProps({
      modelValue: 'test2',
    })

    await wrapper.vm.$nextTick()

    expect(input.element.value).toBe('test2')

    wrapper.unmount()
  })

  it('should emit update:modelValue', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'test',
      },
    })

    await wrapper.find('input').setValue('test2')

    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
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

  it('should display error state', async () => {
    const wrapper = mount(Input, {
      props: {
        error: true,
      },
    })

    const classes = wrapper.classes()
    expect(classes.includes('is-error')).toBe(true)

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

  it('should not apply maxLength while composing', async () => {
    const wrapper = mount(Input, {
      props: {
        maxLength: 3,
      },
    })

    const input = wrapper.find('input')
    expect(input.attributes('maxlength')).toBe('3')

    await input.trigger('compositionstart')
    expect(input.attributes('maxlength')).toBeUndefined()

    await input.trigger('compositionend')
    expect(input.attributes('maxlength')).toBe('3')

    wrapper.unmount()
  })

  it('should keep overflow value after composing by default', async () => {
    const wrapper = mount(Input, {
      props: {
        maxLength: 3,
      },
    })

    const input = wrapper.find('input')
    input.element.value = 'test'

    await input.trigger('compositionend')

    expect(input.element.value).toBe('test')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['test'])

    wrapper.unmount()
  })

  it('should trim overflow value after composing when trimOverflow is true', async () => {
    const wrapper = mount(Input, {
      props: {
        maxLength: 3,
        trimOverflow: true,
      },
    })

    const input = wrapper.find('input')
    input.element.value = 'test'

    await input.trigger('compositionend')

    expect(input.element.value).toBe('tes')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['tes'])

    wrapper.unmount()
  })

  it('should consume Escape when clearing a value', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'test',
      },
    })

    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })

    wrapper.find('input').element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([''])

    wrapper.unmount()
  })

  it('should let Escape through when there is nothing to clear', async () => {
    const wrapper = mount(Input)

    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })

    wrapper.find('input').element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)

    wrapper.unmount()
  })

  it('should ignore keydown while composing', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'test',
      },
    })

    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    Object.assign(event, { isComposing: true })

    wrapper.find('input').element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })
})
