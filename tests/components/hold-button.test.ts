import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import HoldButton from '../../src/components/hold-button/index.vue'

describe('HoldButton', () => {

  it('should trigger `confirm` and `finished` event', async () => {
    const transitionEndEvent = new Event('transitionend')
    Object.defineProperty(transitionEndEvent, 'propertyName', {
      value: 'clip-path'
    })

    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({
        getPropertyValue: () => 'inset(0px)'
      })
    })

    const wrapper = mount(HoldButton, {
      props: {
        durations: 0.01
      }
    })

    await wrapper.trigger('pointerdown')

    const overlay = wrapper.find('.pxd-hold-button--overlay')
    overlay.element.dispatchEvent(transitionEndEvent)
    await wrapper.vm.$nextTick()

    await wrapper.trigger('pointerup')

    expect(wrapper.emitted()).toHaveProperty('confirm')
    expect(wrapper.emitted()).toHaveProperty('finished')
    expect(wrapper.emitted().finished[0]).toEqual([true])
  })

  it('should trigger `canceled` and `finished` event', async () => {
    const wrapper = mount(HoldButton, {
      props: {
        cancelable: true,
        durations: 0.01
      }
    })

    await wrapper.trigger('pointerdown')
    await wrapper.trigger('pointerleave')

    expect(wrapper.emitted()).toHaveProperty('canceled')

    await wrapper.trigger('pointerup')

    expect(wrapper.emitted()).toHaveProperty('finished')
    expect(wrapper.emitted().finished[0]).toEqual([false])
  })

  it('should trigger `finished` event and reset value is truth', async () => {
    vi.useFakeTimers()

    const transitionEndEvent = new Event('transitionend')
    Object.defineProperty(transitionEndEvent, 'propertyName', {
      value: 'clip-path'
    })

    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({
        getPropertyValue: () => 'inset(0px)'
      })
    })

    const wrapper = mount(HoldButton, {
      props: {
        durations: 0.1
      }
    })

    await wrapper.trigger('pointerdown')

    // 500ms after pointerdown
    vi.advanceTimersByTime(500)

    const overlay = wrapper.find('.pxd-hold-button--overlay')
    overlay.element.dispatchEvent(transitionEndEvent)
    await wrapper.vm.$nextTick()

    await wrapper.trigger('pointerup')

    expect(wrapper.emitted()).toHaveProperty('finished')
    expect(wrapper.emitted().finished[0]).toEqual([true])

    vi.useRealTimers()
  })
})
