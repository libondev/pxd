import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Progress from '../../src/components/progress/index.vue'

describe('progress', () => {
  it('renders properly', () => {
    const wrapper = mount(Progress, {
      props: {
        modelValue: 30,
        max: 100,
      },
    })

    expect(wrapper.element.tagName).toBe('PROGRESS')
    expect(wrapper.element.getAttribute('max')).toBe('100')
    expect(wrapper.element.getAttribute('value')).toBe('30')

    wrapper.unmount()
  })

  it('should change model-value', async () => {
    const wrapper = mount(Progress, {
      props: {
        modelValue: 30,
      },
    })

    expect(wrapper.element.tagName).toBe('PROGRESS')
    expect(wrapper.element.getAttribute('value')).toBe('30')

    wrapper.setProps({
      modelValue: 50,
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.element.getAttribute('value')).toBe('50')

    wrapper.unmount()
  })
})
