import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ScalableText from '../../src/components/scalable-text/index.vue'

describe('scalable-text', () => {
  it('renders properly', () => {
    const wrapper = mount(ScalableText, {
      props: {
        text: 'Scalable text',
      },
      slots: {
        default: 'Scalable text',
      },
    })

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should accept minFontSize prop', () => {
    const wrapper = mount(ScalableText, {
      props: {
        text: 'Text',
        minFontSize: 14,
      },
      slots: {
        default: 'Text',
      },
    })

    expect(wrapper.props('minFontSize')).toBe(14)

    wrapper.unmount()
  })

  it('should default minFontSize to 12', () => {
    const wrapper = mount(ScalableText, {
      props: {
        text: 'Text',
      },
      slots: {
        default: 'Text',
      },
    })

    expect(wrapper.props('minFontSize')).toBe(12)

    wrapper.unmount()
  })
})
