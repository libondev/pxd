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
      },
      slots: {
        default: '<button>Hover</button>',
      },
    })

    const popover = wrapper.findComponent(Popover)

    expect(popover.props('showArrow')).toBe(false)
    expect(popover.props('destroyDelay')).toBe(100)
    expect(popover.props('triggerSelector')).toBe('[data-tooltip-trigger]')

    wrapper.unmount()
  })

  it('should let a single trigger take the popover attributes with as-child', () => {
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: {
        content: 'Text',
        asChild: true,
      },
      slots: {
        default: '<button aria-label="Info">Hover</button>',
      },
    })

    const button = document.body.querySelector<HTMLButtonElement>('button')!

    expect(button.hasAttribute('data-tooltip')).toBe(true)
    expect(button.hasAttribute('data-popover')).toBe(true)
    expect(button.getAttribute('aria-label')).toBe('Info')
    expect(document.body.querySelector('div.pxd-popover')).toBeNull()

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
