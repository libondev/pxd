import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Text from '../../src/components/text/index.vue'

describe('text', () => {
  it('renders properly', () => {
    const wrapper = mount(Text, {
      slots: {
        default: 'Text content',
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Text content')

    wrapper.unmount()
  })

  it('should default as to p', () => {
    const wrapper = mount(Text)

    expect(wrapper.element.tagName).toBe('P')

    wrapper.unmount()
  })

  it('should render as custom tag', () => {
    const wrapper = mount(Text, {
      props: {
        as: 'span',
      },
    })

    expect(wrapper.element.tagName).toBe('SPAN')

    wrapper.unmount()
  })

  it('should default align to left', () => {
    const wrapper = mount(Text)

    expect(wrapper.props('align')).toBe('left')

    wrapper.unmount()
  })

  it('should accept custom align', () => {
    const wrapper = mount(Text, {
      props: {
        align: 'center',
      },
    })

    expect(wrapper.props('align')).toBe('center')

    wrapper.unmount()
  })

  it('should accept monospace prop', () => {
    const wrapper = mount(Text, {
      props: {
        monospace: true,
      },
    })

    expect(wrapper.props('monospace')).toBe(true)

    wrapper.unmount()
  })

  it('should accept secondary prop', () => {
    const wrapper = mount(Text, {
      props: {
        secondary: true,
      },
    })

    expect(wrapper.props('secondary')).toBe(true)

    wrapper.unmount()
  })
})
