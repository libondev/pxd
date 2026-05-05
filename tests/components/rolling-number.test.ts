import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import RollingNumber from '../../src/components/rolling-number/index.vue'

describe('rolling-number', () => {
  it('should render with default value', () => {
    const wrapper = mount(RollingNumber)

    expect(wrapper.find('.pxd-rolling-number').exists()).toBe(true)
    expect(wrapper.find('.pxd-rolling-number--value').text()).toBe('0')

    wrapper.unmount()
  })

  it('should render with initial value', () => {
    const wrapper = mount(RollingNumber, {
      props: {
        value: 42,
        durations: 0,
      },
    })

    expect(wrapper.find('.pxd-rolling-number--value').text()).toBe('42')

    wrapper.unmount()
  })

  it('should render negative value', () => {
    const wrapper = mount(RollingNumber, {
      props: {
        value: -100,
        durations: 0,
      },
    })

    expect(wrapper.find('.pxd-rolling-number--value').text()).toBe('-100')

    wrapper.unmount()
  })

  it('should render decimal value', () => {
    const wrapper = mount(RollingNumber, {
      props: {
        value: 3.14,
        durations: 0,
      },
    })

    expect(wrapper.find('.pxd-rolling-number--value').text()).toBe('3.14')

    wrapper.unmount()
  })

  it('should format with comma separator', () => {
    const wrapper = mount(RollingNumber, {
      props: {
        value: 1234567,
        thousands: true,
        durations: 0,
      },
    })

    expect(wrapper.find('.pxd-rolling-number--value').text()).toBe('1,234,567')

    wrapper.unmount()
  })

  it('should format decimal with comma separator', () => {
    const wrapper = mount(RollingNumber, {
      props: {
        value: 1234567.89,
        thousands: true,
        durations: 0,
      },
    })

    expect(wrapper.find('.pxd-rolling-number--value').text()).toBe('1,234,567.89')

    wrapper.unmount()
  })

  it('should expose displayValue and formattedValue', () => {
    const wrapper = mount(RollingNumber, {
      props: {
        value: 100,
        durations: 0,
      },
    })

    expect(wrapper.vm.displayValue).toBe(100)
    expect(wrapper.vm.formattedValue).toBe('100')

    wrapper.unmount()
  })

  it('should have proper accessibility attributes', () => {
    const wrapper = mount(RollingNumber, {
      props: {
        value: 50,
        durations: 0,
      },
    })

    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
    expect(wrapper.find('[aria-atomic="true"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should not display -0 during negative animation', () => {
    const wrapper = mount(RollingNumber, {
      props: {
        value: -100,
        durations: 1000,
      },
    })

    wrapper.vm.displayValue = -0.3
    expect(wrapper.vm.formattedValue).toBe('0')

    wrapper.vm.displayValue = -0.49
    expect(wrapper.vm.formattedValue).toBe('0')

    wrapper.vm.displayValue = -1
    expect(wrapper.vm.formattedValue).toBe('-1')

    wrapper.unmount()
  })

  it('should handle zero duration (no animation)', () => {
    const wrapper = mount(RollingNumber, {
      props: {
        value: 99,
        durations: 0,
      },
    })

    expect(wrapper.find('.pxd-rolling-number--value').text()).toBe('99')
    expect(wrapper.emitted()).toHaveProperty('finish')

    wrapper.unmount()
  })
})
