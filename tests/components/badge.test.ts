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

  it('renders a close button that cannot submit a form', () => {
    const wrapper = mount(Badge, {
      props: {
        closeable: true,
      },
    })

    expect(wrapper.find('button').attributes('type')).toBe('button')

    wrapper.unmount()
  })

  it('defaults to a non-submitting button when rendered as a button', () => {
    const wrapper = mount(Badge, {
      props: {
        as: 'button',
      },
    })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')

    wrapper.unmount()
  })
})
