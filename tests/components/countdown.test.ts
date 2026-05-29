import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Countdown from '../../src/components/countdown/index.vue'

describe('countdown', () => {
  it('renders properly', () => {
    const wrapper = mount(Countdown)

    expect(wrapper.find('.pxd-countdown').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should accept durations prop', () => {
    const wrapper = mount(Countdown, {
      props: {
        durations: 5000,
      },
    })

    expect(wrapper.props('durations')).toBe(5000)

    wrapper.unmount()
  })

  it('should accept format prop', () => {
    const wrapper = mount(Countdown, {
      props: {
        format: 'mm:ss',
      },
    })

    expect(wrapper.props('format')).toBe('mm:ss')

    wrapper.unmount()
  })

  it('should default to HH:mm:ss format', () => {
    const wrapper = mount(Countdown)

    expect(wrapper.props('format')).toBe('HH:mm:ss')

    wrapper.unmount()
  })

  it('should accept active prop', () => {
    const wrapper = mount(Countdown, {
      props: {
        active: true,
      },
    })

    expect(wrapper.props('active')).toBe(true)

    wrapper.unmount()
  })

  it('should render scoped slot', () => {
    const wrapper = mount(Countdown, {
      props: {
        durations: 5000,
      },
      slots: {
        default: '<template #default="{ times }"><span>{{ times }}</span></template>',
      },
    })

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })
})
