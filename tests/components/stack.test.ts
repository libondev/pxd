import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Stack from '../../src/components/stack/index.vue'

describe('stack', () => {
  it('should render component and its children', () => {
    const wrapper = mount(Stack, {
      slots: {
        default: '<div>内容测试</div>',
      },
    })

    expect(wrapper.find('.pxd-stack').exists()).toBe(true)
    expect(wrapper.html()).toContain('<div>内容测试</div>')

    wrapper.unmount()
  })

  it('should render default styles', () => {
    const wrapper = mount(Stack)

    const classes = wrapper.classes()
    expect(classes).toContain('flex')
    expect(classes).toContain('flex-row')
    expect(wrapper.attributes('style')).toContain('--gap: 8px')

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

    expect(wrapper.attributes('style')).toContain('--gap: 16px')

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
    expect(classes.join(' ')).toContain('xs:flex-col')

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
    expect(style).toContain('--xs-gap: 4px')
    expect(style).toContain('--md-gap: 12px')

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
    expect(classes.join(' ')).toContain('xs:flex-col')

    const style = wrapper.attributes('style')
    expect(style).toContain('--xs-gap: 4px')
    expect(style).toContain('--md-gap: 8px')
    expect(style).toContain('--lg-gap: 16px')

    wrapper.unmount()
  })
})
