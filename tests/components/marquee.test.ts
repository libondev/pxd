import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Marquee from '../../src/components/marquee/index.vue'

async function flushDoubleRaf() {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

describe('marquee', () => {
  it('renders properly', () => {
    const wrapper = mount(Marquee)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(Marquee, {
      slots: {
        default: '<span>Scrolling text</span>',
      },
    })

    expect(wrapper.text()).toContain('Scrolling text')

    wrapper.unmount()
  })

  it('should pause on pointer enter by default', async () => {
    const wrapper = mount(Marquee, {
      props: {
        text: 'Hover to pause',
        delay: 0,
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 0))
    await flushDoubleRaf()
    await wrapper.vm.$nextTick()

    await wrapper.trigger('pointerenter')
    await wrapper.vm.$nextTick()

    const style = wrapper.find('.pxd-marquee--content').attributes('style') ?? ''
    expect(style).toContain('transition-duration: 0s')
    expect(style).toContain('translateX')

    wrapper.unmount()
  })

  it('should not pause on pointer enter when pauseOnHover is false', async () => {
    const wrapper = mount(Marquee, {
      props: {
        text: 'Keep scrolling',
        delay: 0,
        pauseOnHover: false,
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 0))
    await flushDoubleRaf()
    await wrapper.vm.$nextTick()

    await wrapper.trigger('pointerenter')
    await wrapper.vm.$nextTick()

    const style = wrapper.find('.pxd-marquee--content').attributes('style') ?? ''
    expect(style).not.toContain('translateX')

    wrapper.unmount()
  })
})
