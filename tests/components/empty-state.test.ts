import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import EmptyState from '../../src/components/empty-state/index.vue'

describe('empty-state', () => {
  it('renders properly', () => {
    const wrapper = mount(EmptyState)

    expect(wrapper.find('.pxd-empty-state').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render title', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No data',
      },
    })

    expect(wrapper.text()).toContain('No data')

    wrapper.unmount()
  })

  it('should render description', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'Empty',
        description: 'Nothing to show here',
      },
    })

    expect(wrapper.text()).toContain('Nothing to show here')

    wrapper.unmount()
  })

  it('should render icon slot', () => {
    const wrapper = mount(EmptyState, {
      slots: {
        icon: '<span>📦</span>',
      },
    })

    expect(wrapper.text()).toContain('📦')

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(EmptyState, {
      slots: {
        default: '<button>Retry</button>',
      },
    })

    expect(wrapper.text()).toContain('Retry')

    wrapper.unmount()
  })
})
