import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Popover from '../../src/components/popover/index.vue'
import Tooltip from '../../src/components/tooltip/index.vue'

describe('tooltip', () => {
  it('renders properly', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Tooltip text',
      },
      slots: {
        default: '<button>Hover me</button>',
      },
    })

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default position to top', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Text',
      },
      slots: {
        default: '<button>Hover</button>',
      },
    })

    expect(wrapper.props('position')).toBe('top')

    wrapper.unmount()
  })

  it('should forward undeclared props to the popover', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Text',
        showArrow: false,
        destroyDelay: 100,
        triggerSelector: '[data-tooltip-trigger]',
        contentStyle: 'color: red',
      },
      slots: {
        default: '<button>Hover</button>',
      },
    })

    const popover = wrapper.findComponent(Popover)

    expect(popover.props('showArrow')).toBe(false)
    expect(popover.props('destroyDelay')).toBe(100)
    expect(popover.props('triggerSelector')).toBe('[data-tooltip-trigger]')
    expect(popover.props('contentStyle')).toBe('color: red')

    wrapper.unmount()
  })

  it('should default variant to default', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Text',
      },
      slots: {
        default: '<button>Hover</button>',
      },
    })

    expect(wrapper.props('variant')).toBe('default')

    wrapper.unmount()
  })

  it('should accept custom variant', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Error tooltip',
        variant: 'error',
      },
      slots: {
        default: '<button>Hover</button>',
      },
    })

    expect(wrapper.props('variant')).toBe('error')

    wrapper.unmount()
  })
})
