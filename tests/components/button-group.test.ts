import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ButtonGroup from '../../src/components/button-group/index.vue'

describe('button-group', () => {
  it('renders properly', () => {
    const wrapper = mount(ButtonGroup, {
      slots: {
        default: '<button>One</button><button>Two</button>',
      },
    })

    expect(wrapper.find('[data-button-group]').exists()).toBe(true)
    expect(wrapper.find('[role="group"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should have correct aria attributes', () => {
    const wrapper = mount(ButtonGroup)

    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('Actions')

    wrapper.unmount()
  })

  it('should render default slot content', () => {
    const wrapper = mount(ButtonGroup, {
      slots: {
        default: '<button>Click me</button>',
      },
    })

    expect(wrapper.text()).toContain('Click me')

    wrapper.unmount()
  })
})
