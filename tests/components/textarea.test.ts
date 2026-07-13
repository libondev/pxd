import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Textarea from '../../src/components/textarea/index.vue'

describe('textarea', () => {
  it('renders properly', async () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: 'test',
      },
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)

    expect(textarea.element.value).toBe('test')

    await textarea.setValue('test2')

    await wrapper.vm.$nextTick()

    expect(textarea.element.value).toBe('test2')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['test2'])

    wrapper.unmount()
  })
  it('should display error state', async () => {
    const wrapper = mount(Textarea, {
      props: {
        error: true,
      },
    })

    const classes = wrapper.classes()
    expect(classes.includes('is-error')).toBe(true)

    wrapper.unmount()
  })
  it('should display word limit with maxlength', async () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: 'test',
        maxlength: 100,
        showWordLimit: true,
      },
    })

    const wordLimit = wrapper.find('.pxd-textarea--word-limit')
    expect(wordLimit.exists()).toBe(true)
    expect(wordLimit.text()).toBe('4 / 100')

    wrapper.unmount()
  })
  it('should display word count without maxlength', async () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: 'test',
        showWordLimit: true,
      },
    })

    const wordLimit = wrapper.find('.pxd-textarea--word-limit')
    expect(wordLimit.exists()).toBe(true)
    expect(wordLimit.text()).toBe('4')

    wrapper.unmount()
  })
  it('should update word count on input', async () => {
    const wrapper = mount(Textarea, {
      props: {
        modelValue: 'test',
        maxlength: 100,
        showWordLimit: true,
      },
    })

    await wrapper.setProps({ modelValue: 'hello world' })
    await wrapper.vm.$nextTick()

    const wordLimit = wrapper.find('.pxd-textarea--word-limit')
    expect(wordLimit.text()).toBe('11 / 100')

    wrapper.unmount()
  })
  it('should not apply maxlength while composing', async () => {
    const wrapper = mount(Textarea, {
      props: {
        maxlength: 3,
      },
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('maxlength')).toBe('3')

    await textarea.trigger('compositionstart')
    expect(textarea.attributes('maxlength')).toBeUndefined()

    await textarea.trigger('compositionend')
    expect(textarea.attributes('maxlength')).toBe('3')

    wrapper.unmount()
  })
  it('should keep overflow value after composing by default', async () => {
    const wrapper = mount(Textarea, {
      props: {
        maxlength: 3,
      },
    })

    const textarea = wrapper.find('textarea')
    textarea.element.value = 'test'

    await textarea.trigger('compositionend')

    expect(textarea.element.value).toBe('test')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })
  it('should trim overflow value after composing when trimOverflow is true', async () => {
    const wrapper = mount(Textarea, {
      props: {
        maxlength: 3,
        trimOverflow: true,
      },
    })

    const textarea = wrapper.find('textarea')
    textarea.element.value = 'test'

    await textarea.trigger('compositionend')

    expect(textarea.element.value).toBe('tes')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['tes'])

    wrapper.unmount()
  })
})
