import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
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
})
