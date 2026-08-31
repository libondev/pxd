import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import DotsSpinner from '../../src/components/spinner-dots/index.vue'

describe('spinner-dots', () => {
  it('renders a custom data list', () => {
    const wrapper = mount(DotsSpinner, {
      props: {
        data: ['a', 'b', 'c'],
      },
    })

    expect(wrapper.findAll('.pxd-spinner-dots--frame')).toHaveLength(3)
    expect(wrapper.text()).toBe('abc')

    wrapper.unmount()
  })

  it('falls back to the variant preset when data is empty', () => {
    const wrapper = mount(DotsSpinner, {
      props: {
        data: [],
        variant: 'dots0',
      },
    })

    expect(wrapper.findAll('.pxd-spinner-dots--frame')).toHaveLength(8)
    expect(wrapper.text()).toContain('⣾')

    wrapper.unmount()
  })

  it('sets the animation duration from frames and interval', () => {
    const wrapper = mount(DotsSpinner, {
      props: {
        data: ['a', 'b', 'c', 'd'],
        interval: 250,
      },
    })

    expect(wrapper.attributes('style')).toContain('--spinner-dots-frames: 4')
    expect(wrapper.attributes('style')).toContain('--spinner-dots-duration: 1000ms')

    wrapper.unmount()
  })

  it('marks the animated track as aria-hidden', () => {
    const wrapper = mount(DotsSpinner)

    expect(wrapper.find('.pxd-spinner-dots').attributes('aria-hidden')).toBe('true')

    wrapper.unmount()
  })
})
