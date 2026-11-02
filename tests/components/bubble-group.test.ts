import type { VirtualListScrollSource } from '../../src/composables/use-virtual-list'
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

  it('follows the bottom when it mounts over loaded items', async () => {
    const wrapper = mount(BubbleGroup, {
      props: {
        data: Array.from({ length: 20 }, (_, index) => ({ id: index })),
        dataKey: 'id',
        virtual: true,
      },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    const { scrollTo } = patchScrollMetrics(container, {
      scrollHeight: 1920,
      clientHeight: 800,
      scrollTop: 0,
    })
    await flushRaf()

    expect(scrollTo).toHaveBeenLastCalledWith({ top: 1120, behavior: 'instant' })
    expect(container.scrollTop).toBe(1120)

    wrapper.unmount()
  })

  it('exposes forceStickToBottom for data-set switches', async () => {
    const wrapper = mount(BubbleGroup, {
      props: {
        data: Array.from({ length: 20 }, (_, index) => ({ id: index })),
        dataKey: 'id',
        virtual: true,
      },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    patchScrollMetrics(container, {
      scrollHeight: 1920,
      clientHeight: 800,
      scrollTop: 0,
    })
    await flushRaf()

    expect(container.scrollTop).toBe(1120)

    container.scrollTop = 300
    container.dispatchEvent(new Event('scroll'))
    await flushRaf()

    ;(wrapper.vm as unknown as { forceStickToBottom: () => void }).forceStickToBottom()
    expect(container.scrollTop).toBe(1120)

    wrapper.unmount()
  })

  it('points the action backtop at the scroll container', async () => {
    const wrapper = mount(BubbleGroup, {
      props: {
        data: [{ id: 'a' }, { id: 'b' }],
        dataKey: 'id',
      },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    patchScrollMetrics(container, {
      scrollHeight: 1000,
      clientHeight: 100,
      scrollTop: 900,
    })

    await flushRaf()

    const backtop = wrapper.find('[data-backtop]').element as HTMLElement

    expect(backtop.style.display).toBe('none')

    container.scrollTop = 0
    container.dispatchEvent(new Event('scroll'))
    await flushRaf()

    expect(backtop.style.display).not.toBe('none')

    wrapper.unmount()
  })

  it('exposes a dom scroll source when virtualization is off', async () => {
    const wrapper = mount(BubbleGroup, {
      props: {
        data: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        dataKey: 'id',
      },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    const { scrollTo } = patchScrollMetrics(container, {
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 200,
    })

    Object.defineProperty(container, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        top: 0,
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    })

    const rows = wrapper.findAll('.pxd-bubble-group--item')

    rows.forEach((row, index) => {
      Object.defineProperty(row.element, 'offsetTop', {
        configurable: true,
        value: index * 100,
      })

      Object.defineProperty(row.element, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({
          top: index * 100,
          bottom: index * 100 + 50,
          height: 50,
          left: 0,
          right: 0,
          width: 0,
          x: 0,
          y: index * 100,
          toJSON: () => ({}),
        }),
      })
    })

    container.dispatchEvent(new Event('scroll'))
    await flushRaf()
    scrollTo.mockClear()

    const source = (wrapper.vm as unknown as { scrollSource: VirtualListScrollSource }).scrollSource

    expect(source.getScrollOffset()).toBe(200)
    expect(source.getMaxScrollOffset()).toBe(200)
    expect(source.getOffsetForIndex(1)).toBe(300)

    source.scrollToIndex(2)
    expect(scrollTo).toHaveBeenCalledWith({ top: 400, behavior: 'auto' })

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
      const scrollSource = (wrapper.vm as unknown as { scrollSource: VirtualListScrollSource })
        .scrollSource

      expect(scrollSource.getOffsetForIndex(0)).toBe(0)
      expect(scrollSource.getOffsetForIndex(2)).toBe(100)
      // Mounting follows the bottom, so the list starts at the last of the 500px
      expect(scrollSource.getScrollOffset()).toBe(400)

      scrollSource.scrollToIndex(2)
      expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 100 }))
    } finally {
      rectSpy.mockRestore()
      wrapper.unmount()
    }
  })
})
