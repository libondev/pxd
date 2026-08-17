import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ShimmerText from '../../src/components/shimmer-text/index.vue'

describe('shimmer-text', () => {
  it('renders properly', () => {
    const wrapper = mount(ShimmerText, {
      props: {
        text: 'Shimmer',
      },
    })

    expect(wrapper.classes()).toContain('pxd-shimmer-text')
    expect(wrapper.text()).toBe('Shimmer')

    wrapper.unmount()
  })

  it('should render the default slot', () => {
    const wrapper = mount(ShimmerText, {
      slots: {
        default: 'Slot Content',
      },
    })

    expect(wrapper.text()).toBe('Slot Content')

    wrapper.unmount()
  })

  it('should set the total duration from durations and interval', () => {
    const wrapper = mount(ShimmerText, {
      props: {
        durations: 1000,
        interval: 200,
      },
    })

    expect(wrapper.attributes('style')).toContain('--shimmer-total-duration: 1200ms')

    wrapper.unmount()
  })

  it('should build the gradient from a variant preset', () => {
    const wrapper = mount(ShimmerText, {
      props: {
        variant: 'bubble',
      },
    })

    expect(wrapper.attributes('data-variant')).toBe('bubble')
    expect((wrapper.vm as any).shimmerStyle.backgroundImage).toContain('#F5EBD9')

    wrapper.unmount()
  })

  it('should build the gradient from a color string', () => {
    const wrapper = mount(ShimmerText, {
      props: {
        color: '#abcdef',
      },
    })

    expect((wrapper.vm as any).shimmerStyle.backgroundImage).toContain('#abcdef')

    wrapper.unmount()
  })

  it('should build the gradient from color stops', () => {
    const wrapper = mount(ShimmerText, {
      props: {
        color: [
          { color: '#111111', position: 0 },
          { color: '#222222', position: 1 },
        ],
      },
    })

    expect((wrapper.vm as any).shimmerStyle.backgroundImage).toContain('#111111')
    expect((wrapper.vm as any).shimmerStyle.backgroundImage).toContain('#222222')

    wrapper.unmount()
  })
})
