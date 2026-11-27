import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
import Carousel from '../../src/components/carousel/index.vue'
import { changePayloads } from '../helpers/changes'

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

const slides = [{ label: 'A' }, { label: 'B' }]

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
        options: slides,
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
        options: slides,
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
        options: slides,
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
        options: slides,
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
        options: slides,
      },
    })

    await nextTick()
    await wrapper.find('.pxd-carousel--next-btn').trigger('click')
    await flushPromises()

    expect(getAnimations).toHaveBeenCalled()
    expect(changePayloads(wrapper)).toEqual([0])
    expect(wrapper.find('.pxd-carousel--slider').attributes('style')).toContain(
      'translateX(calc(0% + 0px))',
    )
    expect(wrapper.attributes('data-loop-placement')).toBe('start')

    wrapper.unmount()
  })

  it('should expose carousel and slide semantics', () => {
    const wrapper = mount(Carousel, {
      props: {
        autoplay: false,
        options: slides,
      },
    })

    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-roledescription')).toBe('carousel')
    expect(wrapper.find('.pxd-carousel--prev-btn').attributes('aria-label')).toBe('Previous slide')
    expect(wrapper.find('.pxd-carousel--next-btn').attributes('aria-label')).toBe('Next slide')

    const items = wrapper.findAll('.pxd-carousel-item')

    expect(items[0].attributes('aria-roledescription')).toBe('slide')
    expect(items[0].attributes('aria-label')).toBe('1 / 2')
    expect(items[1].attributes('aria-label')).toBe('2 / 2')

    wrapper.unmount()
  })

  it('should move to the slide that receives focus', async () => {
    Element.prototype.getAnimations = vi.fn().mockReturnValue([])

    const wrapper = mount(Carousel, {
      props: {
        autoplay: false,
        loop: true,
        options: [{ label: 'A' }, { label: 'B' }, { label: 'C' }],
      },
    })

    wrapper
      .findAll('.pxd-carousel-item')[2]
      .element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    await flushPromises()

    expect(changePayloads(wrapper)).toEqual([2])

    wrapper.unmount()
  })

  it('should pause autoplay while something inside has focus', async () => {
    const wrapper = mount(Carousel, {
      props: {
        autoplay: true,
        options: slides,
      },
    })

    expect(wrapper.attributes('data-autoplay-paused')).toBeUndefined()

    const button = wrapper.find('.pxd-carousel--next-btn')

    button.element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    await nextTick()

    expect(wrapper.attributes('data-autoplay-paused')).toBe('true')

    button.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    await nextTick()

    expect(wrapper.attributes('data-autoplay-paused')).toBeUndefined()

    wrapper.unmount()
  })

  it('should stay paused after a drag while the pointer is still over it', async () => {
    const wrapper = mount(Carousel, {
      props: {
        autoplay: true,
        options: slides,
      },
      attachTo: document.body,
    })

    wrapper.element.dispatchEvent(new PointerEvent('pointerenter'))
    await nextTick()

    expect(wrapper.attributes('data-autoplay-paused')).toBe('true')

    const slider = wrapper.find('.pxd-carousel--slider').element

    slider.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, clientX: 20, clientY: 20, pointerId: 1 }),
    )
    window.dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, clientX: 20, clientY: 20, pointerId: 1 }),
    )
    await nextTick()

    expect(wrapper.attributes('data-autoplay-paused')).toBe('true')

    wrapper.unmount()
  })

  it('should hide indicators and arrows when show flags are false', async () => {
    const wrapper = mount(Carousel, {
      props: {
        options: slides,
        showIndicator: false,
        showArrow: false,
      },
    })

    await nextTick()

    expect(wrapper.find('.pxd-carousel--indicator').exists()).toBe(false)
    expect(wrapper.find('.pxd-carousel--toggler').exists()).toBe(false)

    wrapper.unmount()
  })

  it('should turn the active indicator upright when it sits on a side', () => {
    const wrapper = mount(Carousel, {
      props: {
        autoplay: false,
        indicatorPosition: 'left',
        options: slides,
      },
    })

    const active = wrapper.find('.pxd-carousel--indicator-item[aria-current="true"]')

    expect(wrapper.attributes('data-indicator-position')).toBe('left')
    expect(active.classes()).toEqual(expect.arrayContaining(['h-8', 'w-2']))
    expect(active.classes()).not.toContain('w-8')

    wrapper.unmount()
  })

  it('should keep the active indicator flat at the bottom', () => {
    const wrapper = mount(Carousel, {
      props: {
        autoplay: false,
        options: slides,
      },
    })

    const active = wrapper.find('.pxd-carousel--indicator-item[aria-current="true"]')

    expect(active.classes()).toEqual(expect.arrayContaining(['h-2', 'w-8']))
    expect(active.classes()).not.toContain('h-8')

    wrapper.unmount()
  })

  it('should render one item per option and count them on the first frame', () => {
    const wrapper = mount(Carousel, {
      props: {
        autoplay: false,
        options: [{ label: 'A' }, { label: 'B' }, { label: 'C' }],
      },
    })

    const slides = wrapper.findAll('.pxd-carousel-item')
    expect(slides).toHaveLength(3)
    expect(slides.map((slide) => slide.text())).toEqual(['A', 'B', 'C'])
    /**
     * Children that register themselves only reach the counter after they mount,
     * which used to leave the first frame without indicators and a zeroed
     * `--carousel-item-count`.
     */
    expect(wrapper.findAll('.pxd-carousel--indicator-item')).toHaveLength(3)
    expect(wrapper.attributes('style')).toContain('--carousel-item-count: 3')

    wrapper.unmount()
  })

  it('should move the progress fill to the active indicator', async () => {
    Element.prototype.getAnimations = vi.fn().mockReturnValue([])

    const wrapper = mount(Carousel, {
      props: {
        autoplay: false,
        loop: true,
        options: slides,
      },
    })

    const progress = () => wrapper.findAll('.pxd-carousel--indicator-progress')
    expect(progress()).toHaveLength(1)
    expect(progress()[0].element.closest('[data-index]')?.getAttribute('data-index')).toBe('0')

    await wrapper.find('.pxd-carousel--next-btn').trigger('click')
    await flushPromises()

    expect(progress()).toHaveLength(1)
    expect(progress()[0].element.closest('[data-index]')?.getAttribute('data-index')).toBe('1')

    wrapper.unmount()
  })

  it('should pass the option and its index to the item slot', () => {
    const wrapper = mount(Carousel, {
      props: {
        autoplay: false,
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ],
      },
      slots: {
        item: ({ item, index }: any) => `${index}-${item.value}`,
      },
    })

    expect(wrapper.findAll('.pxd-carousel-item').map((slide) => slide.text())).toEqual([
      '0-a',
      '1-b',
    ])

    wrapper.unmount()
  })
})

describe('carousel engine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const three = [{ label: 'A' }, { label: 'B' }, { label: 'C' }]

  function mountCarousel(props: Record<string, unknown> = {}) {
    return mount(Carousel, {
      props: { options: three, ...props },
    })
  }

  function activeIndex(wrapper: ReturnType<typeof mountCarousel>) {
    const active = wrapper.find('.pxd-carousel--indicator-item[aria-current="true"]')

    return Number(active.attributes('data-index'))
  }

  async function settle() {
    for (let i = 0; i < 10; i++) {
      await Promise.resolve()
      await nextTick()
    }
  }

  it('should normalize the initial index when looping', () => {
    const wrapper = mountCarousel({ index: 4, autoplay: false })

    expect(activeIndex(wrapper)).toBe(1)
    expect(wrapper.find('.pxd-carousel--slider').attributes('style')).toContain(
      'translateX(calc(-100%',
    )

    wrapper.unmount()
  })

  it('should clamp the initial index when loop is off', () => {
    const wrapper = mountCarousel({ index: 4, autoplay: false, loop: false })

    expect(activeIndex(wrapper)).toBe(2)
    expect(wrapper.find('.pxd-carousel--slider').attributes('style')).toContain(
      'translateX(calc(-200%',
    )

    wrapper.unmount()
  })

  it('should move next and prev within the bounds', async () => {
    const wrapper = mountCarousel({ autoplay: false, loop: false })

    await wrapper.find('.pxd-carousel--next-btn').trigger('click')
    await settle()
    expect(activeIndex(wrapper)).toBe(1)

    await wrapper.find('.pxd-carousel--prev-btn').trigger('click')
    await settle()
    expect(activeIndex(wrapper)).toBe(0)
    expect(changePayloads(wrapper)).toEqual([1, 0])

    wrapper.unmount()
  })

  it('should stop at the edges when loop is off', async () => {
    const wrapper = mountCarousel({
      autoplay: false,
      loop: false,
      options: [{ label: 'A' }, { label: 'B' }],
    })

    await wrapper.find('.pxd-carousel--next-btn').trigger('click')
    await settle()
    await wrapper.find('.pxd-carousel--next-btn').trigger('click')
    await settle()

    expect(activeIndex(wrapper)).toBe(1)
    expect(changePayloads(wrapper)).toEqual([1])

    wrapper.unmount()
  })

  it('should wrap around when looping', async () => {
    const wrapper = mountCarousel({ autoplay: false, index: 2 })

    await wrapper.find('.pxd-carousel--next-btn').trigger('click')
    await settle()

    expect(activeIndex(wrapper)).toBe(0)
    expect(changePayloads(wrapper)).toEqual([0])

    wrapper.unmount()
  })

  it('should jump to a target index from the indicators', async () => {
    const wrapper = mountCarousel({ autoplay: false })

    await wrapper.findAll('.pxd-carousel--indicator-item')[2].trigger('click')
    await settle()
    expect(activeIndex(wrapper)).toBe(2)

    await wrapper.findAll('.pxd-carousel--indicator-item')[2].trigger('click')
    await settle()
    expect(changePayloads(wrapper)).toEqual([2])

    wrapper.unmount()
  })

  it('should advance on the interval while autoplay is on', async () => {
    const wrapper = mountCarousel({ interval: 1000 })

    await vi.advanceTimersByTimeAsync(1000)
    await settle()
    expect(activeIndex(wrapper)).toBe(1)

    await vi.advanceTimersByTimeAsync(1000)
    await settle()
    expect(activeIndex(wrapper)).toBe(2)

    wrapper.unmount()
  })

  it('should pause and resume autoplay', async () => {
    const wrapper = mountCarousel({ interval: 1000 })

    wrapper.element.dispatchEvent(new PointerEvent('pointerenter'))
    await nextTick()
    expect(wrapper.attributes('data-autoplay-paused')).toBe('true')

    await vi.advanceTimersByTimeAsync(3000)
    await settle()
    expect(activeIndex(wrapper)).toBe(0)

    wrapper.element.dispatchEvent(new PointerEvent('pointerleave'))
    await nextTick()

    await vi.advanceTimersByTimeAsync(1000)
    await settle()
    expect(activeIndex(wrapper)).toBe(1)

    wrapper.unmount()
  })

  it('should continue the rest of the interval after a pause', async () => {
    const wrapper = mountCarousel({ interval: 1000 })

    await vi.advanceTimersByTimeAsync(600)
    wrapper.element.dispatchEvent(new PointerEvent('pointerenter'))
    await nextTick()

    await vi.advanceTimersByTimeAsync(5000)
    await settle()
    expect(activeIndex(wrapper)).toBe(0)

    wrapper.element.dispatchEvent(new PointerEvent('pointerleave'))
    await nextTick()

    await vi.advanceTimersByTimeAsync(399)
    await settle()
    expect(activeIndex(wrapper)).toBe(0)

    await vi.advanceTimersByTimeAsync(1)
    await settle()
    expect(activeIndex(wrapper)).toBe(1)

    wrapper.unmount()
  })

  it('should not restart the cycle when resume follows no pause', async () => {
    const wrapper = mountCarousel({ interval: 1000 })

    await vi.advanceTimersByTimeAsync(800)
    wrapper.element.dispatchEvent(new PointerEvent('pointerleave'))
    await nextTick()

    await vi.advanceTimersByTimeAsync(199)
    await settle()
    expect(activeIndex(wrapper)).toBe(0)

    await vi.advanceTimersByTimeAsync(1)
    await settle()
    expect(activeIndex(wrapper)).toBe(1)

    wrapper.unmount()
  })

  it('should keep the frozen progress when a paused carousel changes slide', async () => {
    const wrapper = mountCarousel({ interval: 1000 })

    await vi.advanceTimersByTimeAsync(600)
    wrapper.element.dispatchEvent(new PointerEvent('pointerenter'))
    await nextTick()

    expect(wrapper.attributes('style')).toContain('--carousel-progress-elapsed: -600ms')

    await wrapper.find('.pxd-carousel--next-btn').trigger('click')
    await settle()

    expect(activeIndex(wrapper)).toBe(1)
    expect(wrapper.attributes('style')).toContain('--carousel-progress-elapsed: -600ms')

    wrapper.element.dispatchEvent(new PointerEvent('pointerleave'))
    await nextTick()
    expect(wrapper.attributes('style')).not.toContain('--carousel-progress-elapsed: -600ms')

    wrapper.unmount()
  })

  it('should freeze the bar at the end of the cycle when the pause lands on the advance', async () => {
    const wrapper = mountCarousel({ interval: 1000 })

    // The timer has fired but the move has not been committed yet: there is no timer to read.
    vi.advanceTimersByTime(1000)
    wrapper.element.dispatchEvent(new PointerEvent('pointerenter'))
    await nextTick()

    expect(wrapper.attributes('data-autoplay-paused')).toBe('true')
    expect(wrapper.attributes('style')).toContain('--carousel-progress-elapsed: -1000ms')

    wrapper.unmount()
  })

  it('should keep autoplay alive when there is nothing to move to', async () => {
    const wrapper = mountCarousel({ interval: 1000, options: [{ label: 'A' }] })

    await vi.advanceTimersByTimeAsync(2000)
    await settle()

    expect(activeIndex(wrapper)).toBe(0)
    expect(vi.getTimerCount()).toBeGreaterThan(0)

    wrapper.unmount()
  })

  it('should clamp the index when the options shrink', async () => {
    const wrapper = mountCarousel({ autoplay: false, index: 2, loop: false })

    await wrapper.setProps({ options: [{ label: 'A' }] })

    expect(activeIndex(wrapper)).toBe(0)

    wrapper.unmount()
  })

  it('should stop the autoplay timer on unmount', async () => {
    const wrapper = mountCarousel({ interval: 1000 })

    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(5000)

    expect(changePayloads(wrapper)).toBeUndefined()
  })
})
