import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Skeleton from '../../src/components/skeleton/index.vue'

describe('skeleton', () => {
  it('renders properly', () => {
    const wrapper = mount(Skeleton)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default loading to true', () => {
    const wrapper = mount(Skeleton)

    expect(wrapper.props('loading')).toBe(true)

    wrapper.unmount()
  })

  it('should accept width and height', () => {
    const wrapper = mount(Skeleton, {
      props: {
        width: 200,
        height: 50,
      },
    })

    expect(wrapper.props('width')).toBe(200)
    expect(wrapper.props('height')).toBe(50)

    wrapper.unmount()
  })

  it('should default height to 24', () => {
    const wrapper = mount(Skeleton)

    expect(wrapper.props('height')).toBe(24)

    wrapper.unmount()
  })

  it('should default shape to default', () => {
    const wrapper = mount(Skeleton)

    expect(wrapper.props('shape')).toBe('default')

    wrapper.unmount()
  })

  it('should accept rounded shape', () => {
    const wrapper = mount(Skeleton, {
      props: {
        shape: 'rounded',
      },
    })

    expect(wrapper.props('shape')).toBe('rounded')

    wrapper.unmount()
  })

  it('should accept square shape', () => {
    const wrapper = mount(Skeleton, {
      props: {
        shape: 'square',
      },
    })

    expect(wrapper.props('shape')).toBe('square')

    wrapper.unmount()
  })

  it('should default animated to true', () => {
    const wrapper = mount(Skeleton)

    expect(wrapper.props('animated')).toBe(true)

    wrapper.unmount()
  })

  it('should render slot when loading is false', () => {
    const wrapper = mount(Skeleton, {
      props: {
        loading: false,
      },
      slots: {
        default: '<span>Content</span>',
      },
    })

    expect(wrapper.text()).toContain('Content')

    wrapper.unmount()
  })
})
