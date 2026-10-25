import type { TocScrollSource } from '../../src/components/toc/types'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
import BubbleGroup from '../../src/components/bubble-group/index.vue'

function patchScrollMetrics(
  el: HTMLElement,
  initial: { scrollHeight: number; clientHeight: number; scrollTop: number },
) {
  const metrics = { ...initial }

  Object.defineProperties(el, {
    scrollHeight: {
      configurable: true,
      get: () => metrics.scrollHeight,
    },
    clientHeight: {
      configurable: true,
      get: () => metrics.clientHeight,
    },
    scrollTop: {
      configurable: true,
      get: () => metrics.scrollTop,
      set: (value: number) => {
        metrics.scrollTop = value
      },
    },
  })

  const scrollTo = vi.fn((options?: ScrollToOptions | number) => {
    if (typeof options === 'number') {
      metrics.scrollTop = options
    } else if (typeof options?.top === 'number') {
      metrics.scrollTop = options.top
    }

    el.dispatchEvent(new Event('scroll'))
  })
  el.scrollTo = scrollTo as unknown as HTMLElement['scrollTo']

  return { metrics, scrollTo }
}

async function flushRaf() {
  await new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve(undefined))
    } else {
      setTimeout(resolve, 16)
    }
  })
  await nextTick()
}

describe('bubble-group', () => {
  it('renders properly', () => {
    const wrapper = mount(BubbleGroup)

    expect(wrapper.find('.pxd-bubble-group').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(BubbleGroup, {
      slots: {
        default: '<div>Messages</div>',
      },
    })

    expect(wrapper.text()).toContain('Messages')

    wrapper.unmount()
  })

  it('keeps following the bottom while items stream in', async () => {
    const wrapper = mount(BubbleGroup, {
      props: { data: [{ id: 1 }, { id: 2 }], dataKey: 'id' },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    const { metrics, scrollTo } = patchScrollMetrics(container, {
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 100,
    })
    await flushRaf()

    metrics.scrollHeight = 300
    await wrapper.setProps({ data: [{ id: 1 }, { id: 2 }, { id: 3 }] })
    await nextTick()
    expect(scrollTo).toHaveBeenCalledWith({ top: 200, behavior: 'instant' })

    metrics.scrollHeight = 500
    container.dispatchEvent(new Event('scroll'))
    await flushRaf()

    await wrapper.setProps({ data: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] })
    await nextTick()
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 400, behavior: 'instant' })

    wrapper.unmount()
  })

  it('exposes a toc source over the virtualizer', async () => {
    // happy-dom has no layout: every box measures as the 50px estimate, so offsets stay stable.
    const rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 50,
      height: 50,
      left: 0,
      right: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect)

    const wrapper = mount(BubbleGroup, {
      props: { data: [{ id: 1 }, { id: 2 }, { id: 3 }], dataKey: 'id', virtual: true },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    const { scrollTo } = patchScrollMetrics(container, {
      scrollHeight: 500,
      clientHeight: 100,
      scrollTop: 0,
    })
    await flushRaf()

    try {
      const tocSource = (wrapper.vm as unknown as { tocSource: TocScrollSource }).tocSource

      expect(tocSource.getOffsetForIndex(0)).toBe(0)
      expect(tocSource.getOffsetForIndex(2)).toBe(100)
      expect(tocSource.getScrollOffset()).toBe(0)

      tocSource.scrollToIndex(2)
      expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 100 }))
    } finally {
      rectSpy.mockRestore()
      wrapper.unmount()
    }
  })
})
