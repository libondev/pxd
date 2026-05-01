import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
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
    expect(classes).toContain('gap-(--xs)')
    expect(classes).toContain('[--xs:1rem]')

    wrapper.unmount()
  })

  it('should apply styles when direction is row', () => {
    const wrapper = mount(Stack, {
      props: {
        direction: 'horizontal',
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
        gap: 6,
      },
    })

    expect(wrapper.attributes('style')).toContain('--xs: 24px')

    wrapper.unmount()
  })

  it('should apply responsive direction settings', () => {
    const wrapper = mount(Stack, {
      props: {
        direction: {
          xs: 'vertical',
          md: 'horizontal',
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

    const classes = wrapper.classes()
    expect(classes).includes('gap-(--xs)')
    expect(classes).toContain('md:gap-(--md)')

    wrapper.unmount()
  })

  it('should combine responsive properties', () => {
    const wrapper = mount(Stack, {
      props: {
        direction: {
          xs: 'vertical',
          lg: 'horizontal',
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
    expect(classes).includes('gap-(--xs)')
    expect(classes).includes('md:gap-(--md)')
    expect(classes).includes('lg:gap-(--lg)')

    wrapper.unmount()
  })
})
