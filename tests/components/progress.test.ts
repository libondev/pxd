import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Progress from '../../src/components/progress/index.vue'

describe('progress', () => {
  it('renders properly', () => {
    const wrapper = mount(Progress, {
      props: {
        modelValue: 30,
        max: 80,
        min: 20,
      },
    })

    expect(wrapper.attributes('aria-valuemin')).toBe('20')
    expect(wrapper.attributes('aria-valuemax')).toBe('80')
    expect(wrapper.attributes('aria-valuenow')).toBe('30')

    wrapper.unmount()
  })

  it('should default to a 0-100 range', () => {
    const wrapper = mount(Progress)

    expect(wrapper.attributes('aria-valuemin')).toBe('0')
    expect(wrapper.attributes('aria-valuemax')).toBe('100')
    expect(wrapper.attributes('aria-valuenow')).toBe('0')

    wrapper.unmount()
  })

  it('should compute the bar width from min and max', () => {
    const wrapper = mount(Progress, {
      props: {
        modelValue: 30,
        min: 20,
        max: 80,
      },
    })

    expect(wrapper.find('.pxd-progress-bar div').attributes('style')).toContain('width: 50%')

    wrapper.unmount()
  })

  it('should update aria-valuenow when modelValue changes', async () => {
    const wrapper = mount(Progress, {
      props: {
        modelValue: 10,
      },
    })

    await wrapper.setProps({ modelValue: 70 })

    expect(wrapper.attributes('aria-valuenow')).toBe('70')

    wrapper.unmount()
  })

  it('should render the size variants', () => {
    const sm = mount(Progress, {
      props: {
        size: 'sm',
      },
    })
    expect(sm.find('.pxd-progress-bar').classes()).toContain('h-2')
    sm.unmount()

    const md = mount(Progress, {
      props: {
        size: 'md',
      },
    })
    expect(md.find('.pxd-progress-bar').classes()).toContain('h-2.5')
    md.unmount()

    const lg = mount(Progress, {
      props: {
        size: 'lg',
      },
    })
    expect(lg.find('.pxd-progress-bar').classes()).toContain('h-3.5')
    lg.unmount()
  })

  it('should render the current value as label when label is true', () => {
    const wrapper = mount(Progress, {
      props: {
        modelValue: 30,
        label: true,
      },
    })

    expect(wrapper.find('span').text()).toBe('30')

    wrapper.unmount()
  })

  it('should prefer the default slot over the label', () => {
    const wrapper = mount(Progress, {
      props: {
        modelValue: 30,
        label: true,
      },
      slots: {
        default: 'Custom',
      },
    })

    expect(wrapper.find('span').text()).toBe('Custom')

    wrapper.unmount()
  })

  it('should pick the bar color from colors thresholds', () => {
    const wrapper = mount(Progress, {
      props: {
        modelValue: 30,
        colors: { 0: 'red', 50: 'green' },
      },
    })

    expect(wrapper.find('.pxd-progress-bar div').attributes('style')).toContain(
      'background-color: red',
    )

    wrapper.unmount()
  })

  it('should expose the variant as a data attribute', () => {
    const wrapper = mount(Progress, {
      props: {
        variant: 'error',
      },
    })

    expect(wrapper.attributes('data-variant')).toBe('error')

    wrapper.unmount()
  })
})
