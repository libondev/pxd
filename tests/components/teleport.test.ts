import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Teleport from '../../src/components/teleport/index.vue'

describe('teleport', () => {
  it('renders properly', () => {
    const wrapper = mount(Teleport)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default to body', () => {
    const wrapper = mount(Teleport)

    expect(wrapper.props('to')).toBe('body')

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(Teleport, {
      slots: {
        default: '<div>Teleported content</div>',
      },
    })

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })
})
