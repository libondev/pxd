import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import CarouselGroup from '../../src/components/carousel-group/index.vue'
import Carousel from '../../src/components/carousel/index.vue'

function dispatchWheel(el: Element, deltaY: number) {
  const ev = new Event('wheel', { cancelable: true }) as Event & { deltaY: number }
  Object.defineProperty(ev, 'deltaY', { value: deltaY })
  el.dispatchEvent(ev)
  return ev
}

describe('carousel-group', () => {
  it('should not prevent page scroll by default (toggleOnWheel is off)', async () => {
    const wrapper = mount(CarouselGroup, {
      props: {
        loop: true,
        autoplay: false,
      },
      slots: {
        default: [
          h(Carousel, null, { default: () => 'A' }),
          h(Carousel, null, { default: () => 'B' }),
        ],
      },
    })

    const ev = dispatchWheel(wrapper.element, 120)
    expect(ev.defaultPrevented).toBe(false)

    wrapper.unmount()
  })

  it('should prevent page scroll when loop is true (wheel toggles slides)', async () => {
    const wrapper = mount(CarouselGroup, {
      props: {
        loop: true,
        autoplay: false,
        toggleOnWheel: true,
      },
      slots: {
        default: [
          h(Carousel, null, { default: () => 'A' }),
          h(Carousel, null, { default: () => 'B' }),
        ],
      },
    })

    const ev = dispatchWheel(wrapper.element, 120)
    expect(ev.defaultPrevented).toBe(true)

    wrapper.unmount()
  })

  it('should prevent page scroll when switching towards an edge in non-loop mode (length=2)', async () => {
    const wrapper = mount(CarouselGroup, {
      props: {
        loop: false,
        autoplay: false,
        toggleOnWheel: true,
      },
      slots: {
        default: [
          h(Carousel, null, { default: () => 'A' }),
          h(Carousel, null, { default: () => 'B' }),
        ],
      },
    })

    const ev = dispatchWheel(wrapper.element, 120)
    expect(ev.defaultPrevented).toBe(true)

    wrapper.unmount()
  })

  it('should not prevent page scroll when already at an edge and trying to go further in non-loop mode', async () => {
    const wrapper = mount(CarouselGroup, {
      props: {
        loop: false,
        autoplay: false,
        toggleOnWheel: true,
      },
      slots: {
        default: [
          h(Carousel, null, { default: () => 'A' }),
          h(Carousel, null, { default: () => 'B' }),
        ],
      },
    })

    const ev = dispatchWheel(wrapper.element, -120)
    expect(ev.defaultPrevented).toBe(false)

    wrapper.unmount()
  })
})
