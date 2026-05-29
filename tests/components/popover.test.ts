import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Popover from '../../src/components/popover/index.vue'

describe('popover', () => {
  it('renders properly', () => {
    const wrapper = mount(Popover, {
      slots: {
        trigger: '<button>Trigger</button>',
      },
    })

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default position to bottom', () => {
    const wrapper = mount(Popover, {
      slots: {
        trigger: '<button>Trigger</button>',
      },
    })

    expect(wrapper.props('position')).toBe('bottom')

    wrapper.unmount()
  })

  it('should accept custom trigger prop', () => {
    const wrapper = mount(Popover, {
      props: {
        trigger: ['click'],
      },
      slots: {
        trigger: '<button>Trigger</button>',
      },
    })

    expect(wrapper.props('trigger')).toEqual(['click'])

    wrapper.unmount()
  })

  it('should default showDelay to 0', () => {
    const wrapper = mount(Popover, {
      slots: {
        trigger: '<button>Trigger</button>',
      },
    })

    expect(wrapper.props('showDelay')).toBe(0)

    wrapper.unmount()
  })

  it('should default closeOnPressEscape to true', () => {
    const wrapper = mount(Popover, {
      slots: {
        trigger: '<button>Trigger</button>',
      },
    })

    expect(wrapper.props('closeOnPressEscape')).toBe(true)

    wrapper.unmount()
  })
})
