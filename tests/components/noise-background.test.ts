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

  it('should blend noise with the component contents', () => {
    const wrapper = mount(NoiseBackground, {
      props: {
        blendMode: 'soft-light',
      },
    })

    expect(wrapper.classes()).toContain('isolate')
    expect(wrapper.find('svg').attributes('style')).toContain('mix-blend-mode: soft-light')

    wrapper.unmount()
  })
})
