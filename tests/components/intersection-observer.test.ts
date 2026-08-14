import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import IntersectionObserverComponent from '../../src/components/intersection-observer/index.vue'

describe('intersection-observer', () => {
  it('renders the container and keeps the slot unmounted until intersecting', () => {
    const wrapper = mount(IntersectionObserverComponent, {
      slots: { default: '<div class="slot-content">Lazy content</div>' },
    })

    expect(wrapper.find('.pxd-intersection-observer').exists()).toBe(true)
    expect(wrapper.find('.slot-content').exists()).toBe(false)

    wrapper.unmount()
  })

  it('maps width and height props to container css variables', () => {
    const wrapper = mount(IntersectionObserverComponent, {
      props: { width: 200, height: 100 },
    })

    expect(wrapper.element.style.getPropertyValue('--slot-estimated-width')).toBe('200px')
    expect(wrapper.element.style.getPropertyValue('--slot-estimated-height')).toBe('100px')

    wrapper.unmount()
  })
})
