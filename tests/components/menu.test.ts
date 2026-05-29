import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Menu from '../../src/components/menu/index.vue'

describe('menu', () => {
  it('renders properly', () => {
    const wrapper = mount(Menu, {
      slots: {
        trigger: '<button>Open Menu</button>',
      },
    })

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should accept options prop', () => {
    const wrapper = mount(Menu, {
      props: {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
      },
      slots: {
        trigger: '<button>Open</button>',
      },
    })

    expect(wrapper.props('options')).toHaveLength(2)

    wrapper.unmount()
  })

  it('should default position to bottom-start', () => {
    const wrapper = mount(Menu, {
      slots: {
        trigger: '<button>Open</button>',
      },
    })

    expect(wrapper.props('position')).toBe('bottom-start')

    wrapper.unmount()
  })
})
