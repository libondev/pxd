import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { h, nextTick } from 'vue'
import CarouselItem from '../../src/components/carousel-item/index.vue'
import Carousel from '../../src/components/carousel/index.vue'

let originalMatchMedia: typeof window.matchMedia
let originalGetAnimations: Element['getAnimations'] | undefined

function dispatchWheel(el: Element, deltaY: number) {
  const ev = new Event('wheel', { cancelable: true }) as Event & { deltaY: number }
  Object.defineProperty(ev, 'deltaY', { value: deltaY })
  el.dispatchEvent(ev)
  return ev
}

describe('carousel', () => {
  beforeEach(() => {
    originalMatchMedia = window.matchMedia
    originalGetAnimations = Reflect.get(Element.prototype, 'getAnimations') as
      | Element['getAnimations']
      | undefined
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.matchMedia = originalMatchMedia

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

  it('should switch immediately when reduced motion is preferred', async () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const getAnimations = vi.fn().mockReturnValue([
      {
        finished: new Promise(() => {}),
      },
    ])
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

    await wrapper.find('.pxd-carousel--next-btn').trigger('click')
    await nextTick()

    expect(getAnimations).not.toHaveBeenCalled()
    expect(wrapper.emitted('change')).toEqual([[0]])
    expect(wrapper.find('.pxd-carousel--slider').attributes('style')).toContain(
      'translateX(calc(0% + 0px))',
    )
    expect(wrapper.attributes('data-loop-placement')).toBe('none')

    wrapper.unmount()
  })
})
