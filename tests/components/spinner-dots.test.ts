import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import DotsSpinner from '../../src/components/dots-spinner/index.vue'

describe('dots-spinner', () => {
  it('renders the default variant frames', () => {
    const wrapper = mount(DotsSpinner)

    expect(wrapper.classes()).toContain('pxd-dots-spinner')
    expect(wrapper.classes()).toContain('h-[1lh]')
    expect(wrapper.findAll('.pxd-dots-spinner--frame')).toHaveLength(10)
    expect(wrapper.text()).toContain('⠋')

    wrapper.unmount()
  })

  it('renders a custom data list', () => {
    const wrapper = mount(DotsSpinner, {
      props: {
        data: ['a', 'b', 'c'],
      },
    })

    expect(wrapper.findAll('.pxd-dots-spinner--frame')).toHaveLength(3)
    expect(wrapper.text()).toBe('abc')

    wrapper.unmount()
  })

  it('falls back to the variant preset when data is empty', () => {
    const wrapper = mount(DotsSpinner, {
      props: {
        data: [],
        variant: 'dots1',
      },
    })

    expect(wrapper.findAll('.pxd-dots-spinner--frame')).toHaveLength(8)
    expect(wrapper.text()).toContain('⣾')

    wrapper.unmount()
  })

  it('renders a named variant preset', () => {
    const wrapper = mount(DotsSpinner, {
      props: {
        variant: 'dots5',
      },
    })

    expect(wrapper.findAll('.pxd-dots-spinner--frame')).toHaveLength(8)
    expect(wrapper.text()).toContain('⢹')

    wrapper.unmount()
  })

  it('sets the animation duration from frames and interval', () => {
    const wrapper = mount(DotsSpinner, {
      props: {
        data: ['a', 'b', 'c', 'd'],
        interval: 250,
      },
    })

    expect(wrapper.attributes('style')).toContain('--dots-spinner-frames: 4')
    expect(wrapper.attributes('style')).toContain('--dots-spinner-duration: 1000ms')

    wrapper.unmount()
  })

  it('marks the animated track as aria-hidden', () => {
    const wrapper = mount(DotsSpinner)

    expect(wrapper.find('.pxd-dots-spinner--track').attributes('aria-hidden')).toBe('true')

    wrapper.unmount()
  })
})
