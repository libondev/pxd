import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
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

  it('should default showArrow to true', () => {
    const wrapper = mount(Tooltip, {
      props: {
        content: 'Text',
      },
      slots: {
        default: '<button>Hover</button>',
      },
    })

    expect(wrapper.props('showArrow')).toBe(true)

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
