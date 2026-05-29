import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Chip from '../../src/components/chip/index.vue'

describe('chip', () => {
  it('renders properly', () => {
    const wrapper = mount(Chip)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(Chip, {
      slots: {
        default: '<span>Icon</span>',
      },
    })

    expect(wrapper.text()).toContain('Icon')

    wrapper.unmount()
  })

  it('should render label when provided', () => {
    const wrapper = mount(Chip, {
      props: {
        label: 5,
      },
    })

    expect(wrapper.find('[data-label="5"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should accept variant prop', () => {
    const wrapper = mount(Chip, {
      props: {
        variant: 'error',
      },
    })

    expect(wrapper.props('variant')).toBe('error')

    wrapper.unmount()
  })
})
