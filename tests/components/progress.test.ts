import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Progress from '../../src/components/progress/index.vue'

describe('progress', () => {
  it('renders properly', () => {
    const wrapper = mount(Progress, {
      props: {
        modelValue: 30,
        max: 80,
        min: 20,
      },
    })

    expect(wrapper.attributes('aria-valuemin')).toBe('20')
    expect(wrapper.attributes('aria-valuemax')).toBe('80')
    expect(wrapper.attributes('aria-valuenow')).toBe('30')

    wrapper.unmount()
  })
})
