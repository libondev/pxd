import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import DashLine from '../../src/components/dash-line/index.vue'

describe('dash-line', () => {
  it('renders properly', () => {
    const wrapper = mount(DashLine)

    expect(wrapper.find('svg').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render a line element', () => {
    const wrapper = mount(DashLine)

    expect(wrapper.find('line').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should accept custom color', () => {
    const wrapper = mount(DashLine, {
      props: {
        color: '#FF0000',
      },
    })

    expect(wrapper.props('color')).toBe('#FF0000')

    wrapper.unmount()
  })

  it('should accept position prop as array', () => {
    const wrapper = mount(DashLine, {
      props: {
        position: ['top', 'bottom'],
      },
    })

    expect(wrapper.props('position')).toEqual(['top', 'bottom'])

    wrapper.unmount()
  })

  it('should accept custom dashSize and gap', () => {
    const wrapper = mount(DashLine, {
      props: {
        dashSize: '10',
        gap: '5',
      },
    })

    expect(wrapper.props('dashSize')).toBe('10')
    expect(wrapper.props('gap')).toBe('5')

    wrapper.unmount()
  })
})
