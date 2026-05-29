import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import NoiseBackground from '../../src/components/noise-background/index.vue'

describe('noise-background', () => {
  it('renders properly', () => {
    const wrapper = mount(NoiseBackground)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(NoiseBackground, {
      slots: {
        default: '<div>Content</div>',
      },
    })

    expect(wrapper.text()).toContain('Content')

    wrapper.unmount()
  })
})
