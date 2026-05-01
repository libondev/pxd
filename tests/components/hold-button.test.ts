import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import HoldButton from '../../src/components/hold-button/index.vue'

describe('hold-button', () => {
  it('should trigger `confirm` and `release` event', async () => {
    const transitionEndEvent = new Event('transitionend')
    Object.defineProperty(transitionEndEvent, 'propertyName', {
      value: 'clip-path',
    })

    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({
        getPropertyValue: () => 'inset(0px)',
      }),
    })

    const wrapper = mount(HoldButton, {
      props: {
        durations: 0.01,
      },
    })

    await wrapper.trigger('pointerdown')

    const overlay = wrapper.find('.pxd-hold-button--overlay')
    overlay.element.dispatchEvent(transitionEndEvent)
    await wrapper.vm.$nextTick()

    document.dispatchEvent(new Event('pointerup'))

    expect(wrapper.emitted()).toHaveProperty('confirm')
    expect(wrapper.emitted()).toHaveProperty('release')
    expect(wrapper.emitted().release[0]).toEqual([true])

    wrapper.unmount()
  })

  it('should trigger `cancel` and `release` event', async () => {
    const wrapper = mount(HoldButton, {
      props: {
        cancelable: true,
        durations: 0.01,
      },
    })

    await wrapper.trigger('pointerdown')
    await wrapper.trigger('pointerleave', {
      buttons: 1,
    })

    expect(wrapper.emitted()).toHaveProperty('cancel')

    document.dispatchEvent(new Event('pointerup'))

    expect(wrapper.emitted()).toHaveProperty('release')
    expect(wrapper.emitted().release[0]).toEqual([false])

    wrapper.unmount()
  })

  it('should trigger `release` event and reset value is truth', async () => {
    vi.useFakeTimers()

    const transitionEndEvent = new Event('transitionend')
    Object.defineProperty(transitionEndEvent, 'propertyName', {
      value: 'clip-path',
    })

    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({
        getPropertyValue: () => 'inset(0px)',
      }),
    })

    const wrapper = mount(HoldButton, {
      props: {
        durations: 0.1,
      },
    })

    await wrapper.trigger('pointerdown')

    // 500ms after pointerdown
    vi.advanceTimersByTime(500)

    const overlay = wrapper.find('.pxd-hold-button--overlay')
    overlay.element.dispatchEvent(transitionEndEvent)
    await wrapper.vm.$nextTick()

    document.dispatchEvent(new Event('pointerup'))

    expect(wrapper.emitted()).toHaveProperty('release')
    expect(wrapper.emitted().release[0]).toEqual([true])

    wrapper.unmount()

    vi.useRealTimers()
  })
})
