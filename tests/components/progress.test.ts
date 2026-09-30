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

    // (30 - 20) / (80 - 20) = 1/6
    expect(wrapper.find('.pxd-progress-bar div').attributes('style')).toContain(
      'width: 16.666666666666664%',
    )

    wrapper.unmount()
  })

  it('should render an empty bar at the min value', () => {
    const wrapper = mount(Progress, {
      props: {
        modelValue: 20,
        min: 20,
        max: 80,
      },
    })

    expect(wrapper.find('.pxd-progress-bar div').attributes('style')).toContain('width: 0%')

    wrapper.unmount()
  })

  it('should fill the whole bar at the max value', () => {
    const wrapper = mount(Progress, {
      props: {
        modelValue: 80,
        min: 20,
        max: 80,
      },
    })

    expect(wrapper.find('.pxd-progress-bar div').attributes('style')).toContain('width: 100%')

    wrapper.unmount()
  })

  it('should pick the color threshold from the default 0-100 range', () => {
    const colors = { 0: 'rgb(1, 1, 1)', 50: 'rgb(2, 2, 2)', 100: 'rgb(3, 3, 3)' }

    const at50 = mount(Progress, { props: { modelValue: 50, colors } })
    expect(at50.find('.pxd-progress-bar div').attributes('style')).toContain(
      'background-color: rgb(2, 2, 2)',
    )
    at50.unmount()

    const at100 = mount(Progress, { props: { modelValue: 100, colors } })
    expect(at100.find('.pxd-progress-bar div').attributes('style')).toContain(
      'background-color: rgb(3, 3, 3)',
    )
    at100.unmount()
  })

  it('should resolve color thresholds against the range, not the absolute value', () => {
    const colors = { 0: 'rgb(1, 1, 1)', 50: 'rgb(2, 2, 2)', 100: 'rgb(3, 3, 3)' }

    const atMin = mount(Progress, { props: { modelValue: 20, min: 20, max: 100, colors } })
    expect(atMin.find('.pxd-progress-bar div').attributes('style')).toContain(
      'background-color: rgb(1, 1, 1)',
    )
    atMin.unmount()

    const atMid = mount(Progress, { props: { modelValue: 60, min: 20, max: 100, colors } })
    expect(atMid.find('.pxd-progress-bar div').attributes('style')).toContain(
      'background-color: rgb(2, 2, 2)',
    )
    atMid.unmount()

    const atMax = mount(Progress, { props: { modelValue: 100, min: 20, max: 100, colors } })
    expect(atMax.find('.pxd-progress-bar div').attributes('style')).toContain(
      'background-color: rgb(3, 3, 3)',
    )
    atMax.unmount()
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
