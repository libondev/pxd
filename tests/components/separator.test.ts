import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Separator from '../../src/components/separator/index.vue'

describe('separator', () => {
  it('renders a vertical separator by default', () => {
    const wrapper = mount(Separator)

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('data-separator')).toBeDefined()
    expect(wrapper.attributes('role')).toBe('separator')
    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
    expect(wrapper.classes()).toContain('pxd-separator')

    wrapper.unmount()
  })

  it('should follow the direction prop', () => {
    const wrapper = mount(Separator, {
      props: {
        direction: 'horizontal',
      },
    })

    expect(wrapper.attributes('aria-orientation')).toBe('horizontal')

    wrapper.unmount()
  })

  it('should forward attributes to the root element', () => {
    const wrapper = mount(Separator, {
      attrs: {
        id: 'above-fold',
        'aria-label': 'section break',
      },
    })

    expect(wrapper.attributes('id')).toBe('above-fold')
    expect(wrapper.attributes('aria-label')).toBe('section break')

    wrapper.unmount()
  })

  it('should merge a class with its own', () => {
    const wrapper = mount(Separator, {
      attrs: {
        class: 'mx-2',
      },
    })

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['pxd-separator', 'mx-2']))

    wrapper.unmount()
  })
})
