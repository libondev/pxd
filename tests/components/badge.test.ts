import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Badge from '../../src/components/badge/index.vue'

describe('badge', () => {
  it('renders properly', () => {
    const wrapper = mount(Badge, {
      slots: {
        default: 'Hello PXD!',
      },
    })

    expect(wrapper.text()).toContain('Hello PXD!')
    expect(wrapper.element.tagName).toBe('SPAN')

    wrapper.unmount()
  })

  it('should render the vue variant', () => {
    const wrapper = mount(Badge, {
      props: {
        variant: 'vue',
      },
    })

    expect(wrapper.attributes('data-variant')).toBe('vue')
    expect(wrapper.classes()).toContain('pxd-badge')

    wrapper.unmount()
  })

  it('should render as a tag', () => {
    const wrapper = mount(Badge, {
      props: {
        as: 'a',
      },
    })

    expect(wrapper.element.tagName).toBe('A')

    wrapper.unmount()
  })
})
