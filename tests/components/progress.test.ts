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

    const progress = wrapper.find('progress')

    expect(progress.element.tagName).toBe('PROGRESS')
    expect(progress.element.getAttribute('max')).toBe('100')
    expect(progress.element.getAttribute('value')).toBe('30')

    wrapper.unmount()
  })
})
