import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Gauge from '../../src/components/gauge/index.vue'

describe('gauge', () => {
  it('should render properly', () => {
    const wrapper = mount(Gauge, {
      props: {
        modelValue: 50,
        showValue: true,
      },
    })

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.findAll('circle').length).toBe(2)
    expect(wrapper.find('[data-pxd-gauge-value]').text()).toBe('50')

    wrapper.unmount()
  })

  it('should render indeterminate', () => {
    const wrapper = mount(Gauge, {
      props: {
        indeterminate: true,
      },
    })

    expect(wrapper.find('.pxd-gauge--indeterminate svg').exists()).toBe(true)
  })
})
