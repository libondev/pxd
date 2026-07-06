import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { h, nextTick } from 'vue'
import CarouselItem from '../../src/components/carousel-item/index.vue'
import Carousel from '../../src/components/carousel/index.vue'

let originalGetAnimations: Element['getAnimations'] | undefined

function dispatchWheel(el: Element, deltaY: number) {
  const ev = new Event('wheel', { cancelable: true }) as Event & { deltaY: number }
  Object.defineProperty(ev, 'deltaY', { value: deltaY })
  el.dispatchEvent(ev)
  return ev
}

function flushPromises() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0)
  })
}

describe('carousel', () => {
  beforeEach(() => {
    originalGetAnimations = Reflect.get(Element.prototype, 'getAnimations') as
      | Element['getAnimations']
      | undefined
  })

  afterEach(() => {
    vi.restoreAllMocks()

    if (originalGetAnimations) {
      Element.prototype.getAnimations = originalGetAnimations
    } else {
      Reflect.deleteProperty(Element.prototype, 'getAnimations')
    }
  })

  it('should not prevent page scroll by default (toggleOnWheel is off)', async () => {
    const wrapper = mount(Carousel, {
      props: {
        loop: true,
        autoplay: false,
      },
      slots: {
        default: [
          h(CarouselItem, null, { default: () => 'A' }),
          h(CarouselItem, null, { default: () => 'B' }),
        ],
      },
    })

    const ev = dispatchWheel(wrapper.element, 120)
    expect(ev.defaultPrevented).toBe(false)

    wrapper.unmount()
  })

  it('should prevent page scroll when loop is true (wheel toggles slides)', async () => {
    const wrapper = mount(Carousel, {
      props: {
        loop: true,
        autoplay: false,
        toggleOnWheel: true,
      },
      slots: {
        default: [
          h(CarouselItem, null, { default: () => 'A' }),
          h(CarouselItem, null, { default: () => 'B' }),
        ],
      },
    })

    const ev = dispatchWheel(wrapper.element, 120)
    expect(ev.defaultPrevented).toBe(true)

    wrapper.unmount()
  })

  it('should prevent page scroll when switching towards an edge in non-loop mode (length=2)', async () => {
    const wrapper = mount(Carousel, {
      props: {
        loop: false,
        autoplay: false,
        toggleOnWheel: true,
      },
      slots: {
        default: [
          h(CarouselItem, null, { default: () => 'A' }),
          h(CarouselItem, null, { default: () => 'B' }),
        ],
      },
    })

    const ev = dispatchWheel(wrapper.element, 120)
    expect(ev.defaultPrevented).toBe(true)

    wrapper.unmount()
  })

  it('should not prevent page scroll when already at an edge and trying to go further in non-loop mode', async () => {
    const wrapper = mount(Carousel, {
      props: {
        loop: false,
        autoplay: false,
        toggleOnWheel: true,
      },
      slots: {
        default: [
          h(CarouselItem, null, { default: () => 'A' }),
          h(CarouselItem, null, { default: () => 'B' }),
        ],
      },
    })

    const ev = dispatchWheel(wrapper.element, -120)
    expect(ev.defaultPrevented).toBe(false)

    wrapper.unmount()
  })

  it('should switch immediately when slider has no animations', async () => {
    const getAnimations = vi.fn().mockReturnValue([])
    Element.prototype.getAnimations = getAnimations

    const wrapper = mount(Carousel, {
      props: {
        index: 1,
        loop: true,
        autoplay: false,
      },
      slots: {
        default: [
          h(CarouselItem, null, { default: () => 'A' }),
          h(CarouselItem, null, { default: () => 'B' }),
        ],
      },
    })

    await nextTick()
    await wrapper.find('.pxd-carousel--next-btn').trigger('click')
    await flushPromises()

    expect(getAnimations).toHaveBeenCalled()
    expect(wrapper.emitted('change')).toEqual([[0]])
    expect(wrapper.find('.pxd-carousel--slider').attributes('style')).toContain(
      'translateX(calc(0% + 0px))',
    )
    expect(wrapper.attributes('data-loop-placement')).toBe('start')

    wrapper.unmount()
  })
})
