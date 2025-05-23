import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Stack from '../../src/components/stack/index.vue'

describe('stack', () => {
  it('should render component and its children', () => {
    const wrapper = mount(Stack, {
      slots: {
        default: '<div>Content Text</div>',
      },
    })

    expect(wrapper.find('.pxd-stack').exists()).toBe(true)
    expect(wrapper.html()).toContain('<div>Content Text</div>')

    wrapper.unmount()
  })

  it('should render default styles', () => {
    const wrapper = mount(Stack)

    const classes = wrapper.classes()
    expect(classes).toContain('flex')
    expect(classes).toContain('flex-row')
    expect(wrapper.attributes('style')).toContain('--gap-xs: 8px')

    wrapper.unmount()
  })

  it('should apply styles when direction is row', () => {
    const wrapper = mount(Stack, {
      props: {
        direction: 'row',
      },
    })

    const classes = wrapper.classes()
    expect(classes).toContain('flex-row')
    expect(classes).not.toContain('flex-col')

    wrapper.unmount()
  })

  it('should apply custom gap value', () => {
    const wrapper = mount(Stack, {
      props: {
        gap: 4,
      },
    })

    expect(wrapper.attributes('style')).toContain('--gap-xs: 16px')

    wrapper.unmount()
  })

  it('should apply responsive direction settings', () => {
    const wrapper = mount(Stack, {
      props: {
        direction: {
          xs: 'col',
          md: 'row',
        },
      },
    })

    const classes = wrapper.classes()
    // The default is xs, so you don't need to add xs prefix.
    expect(classes).includes('flex-col')
    expect(classes).includes('md:flex-row')

    wrapper.unmount()
  })

  it('should apply responsive gap settings', () => {
    const wrapper = mount(Stack, {
      props: {
        gap: {
          xs: 1,
          md: 3,
        },
      },
    })

    const style = wrapper.attributes('style')
    expect(style).toContain('--gap-xs: 4px')
    expect(style).toContain('--gap-md: 12px')

    wrapper.unmount()
  })

  it('should combine responsive properties', () => {
    const wrapper = mount(Stack, {
      props: {
        direction: {
          xs: 'col',
          lg: 'row',
        },
        gap: {
          xs: 1,
          md: 2,
          lg: 4,
        },
      },
    })

    const classes = wrapper.classes()
    expect(classes).includes('flex-col')
    expect(classes).includes('lg:flex-row')

    const style = wrapper.attributes('style')
    expect(style).toContain('--gap-xs: 4px')
    expect(style).toContain('--gap-md: 8px')
    expect(style).toContain('--gap-lg: 16px')

    wrapper.unmount()
  })
})
