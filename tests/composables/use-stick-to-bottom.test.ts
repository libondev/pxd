import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
import StickToBottom from '../../src/components/stick-to-bottom/index.vue'

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

describe('PStickToBottom', () => {
  it('renders slot content inside a scroll container', () => {
    const wrapper = mount(StickToBottom, {
      slots: {
        default: '<div class="item">hello</div>',
      },
    })

    expect(wrapper.find('.pxd-stick-to-bottom').exists()).toBe(true)
    expect(wrapper.find('.pxd-stick-to-bottom--content .item').exists()).toBe(true)
  })

  it('exposes stick-to-bottom controls', () => {
    const wrapper = mount(StickToBottom, {
      slots: { default: '<div>content</div>' },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    const { scrollTo } = patchScrollMetrics(container, {
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 100,
    })

    const vm = wrapper.vm as unknown as {
      isAtBottom: boolean
      scrollToBottom: (behavior?: ScrollBehavior) => void
      forceStickToBottom: () => void
      stickIfNeeded: () => void
      update: () => void
    }

    expect(vm.isAtBottom).toBe(true)

    vm.scrollToBottom()
    expect(scrollTo).toHaveBeenCalled()

    container.scrollTop = 0
    container.dispatchEvent(new Event('scroll'))
    vm.update()
    expect(vm.isAtBottom).toBe(false)

    vm.forceStickToBottom()
    expect(container.scrollTop).toBe(100)
    expect(vm.isAtBottom).toBe(true)
  })

  it('emits change when at-bottom state changes', async () => {
    const wrapper = mount(StickToBottom, {
      slots: { default: '<div>content</div>' },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    patchScrollMetrics(container, {
      scrollHeight: 400,
      clientHeight: 100,
      scrollTop: 0,
    })

    // Listeners attach on the flush after mount, and the mount itself lands on the bottom
    await flushRaf()
    expect(container.scrollTop).toBe(300)

    const vm = wrapper.vm as unknown as {
      isAtBottom: boolean
      update: () => void
    }

    container.scrollTop = 0
    container.dispatchEvent(new Event('scroll'))
    await flushRaf()
    vm.update()

    expect(vm.isAtBottom).toBe(false)
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')?.at(-1)).toEqual([false])
  })

  it('applies default props', () => {
    const wrapper = mount(StickToBottom)

    expect(wrapper.props('threshold')).toBe(16)
    expect(wrapper.props('enabled')).toBe(true)
  })

  it('survives a correction that writes the offset before the layout catches up', async () => {
    const wrapper = mount(StickToBottom, {
      slots: { default: '<div>content</div>' },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    const { metrics } = patchScrollMetrics(container, {
      scrollHeight: 1920,
      clientHeight: 800,
      scrollTop: 0,
    })
    await flushRaf()

    expect(container.scrollTop).toBe(1120)

    const vm = wrapper.vm as unknown as { stickIfNeeded: () => void }

    // A virtualizer re-measuring shorter items writes the offset first,
    container.scrollTop = 400
    container.dispatchEvent(new Event('scroll'))

    // and the height it was compensating for only lands in the next frame
    metrics.scrollHeight = 1200
    await flushRaf()

    // The move was the layout's, so the container keeps following
    metrics.scrollHeight = 5000
    vm.stickIfNeeded()
    expect(container.scrollTop).toBe(4200)

    wrapper.unmount()
  })

  it('stops following when the interaction leaves the view off the bottom', async () => {
    const wrapper = mount(StickToBottom, {
      slots: { default: '<div class="panel">content</div>' },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    const { metrics } = patchScrollMetrics(container, {
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 100,
    })
    await flushRaf()

    const vm = wrapper.vm as unknown as { stickIfNeeded: () => void }
    const now = vi.spyOn(performance, 'now')

    try {
      // Expanding a panel grows the content while the interaction window is open
      now.mockReturnValue(1000)
      wrapper.find('.panel').element.dispatchEvent(new Event('pointerdown', { bubbles: true }))

      metrics.scrollHeight = 600
      vm.stickIfNeeded()
      expect(container.scrollTop).toBe(100)

      // Later growth must not yank the view back down: the interaction ended follow
      now.mockReturnValue(2000)
      metrics.scrollHeight = 800
      vm.stickIfNeeded()
      expect(container.scrollTop).toBe(100)

      // Scrolling back to the bottom resumes it
      container.scrollTop = 700
      container.dispatchEvent(new Event('scroll'))
      metrics.scrollHeight = 900
      vm.stickIfNeeded()
      expect(container.scrollTop).toBe(800)
    } finally {
      now.mockRestore()
      wrapper.unmount()
    }
  })

  it('keeps following when content grows after the programmatic scroll', async () => {
    const wrapper = mount(StickToBottom, {
      slots: { default: '<div>content</div>' },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    const { metrics } = patchScrollMetrics(container, {
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 100,
    })
    await flushRaf()

    const vm = wrapper.vm as unknown as {
      isAtBottom: boolean
      scrollToBottom: () => void
      stickIfNeeded: () => void
    }

    vm.scrollToBottom()
    expect(container.scrollTop).toBe(100)

    metrics.scrollHeight = 600
    container.dispatchEvent(new Event('scroll'))

    expect(vm.isAtBottom).toBe(true)

    vm.stickIfNeeded()
    expect(container.scrollTop).toBe(500)
  })

  it('stops following when the user scrolls away and resumes at the bottom', async () => {
    const wrapper = mount(StickToBottom, {
      slots: { default: '<div>content</div>' },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    const { metrics } = patchScrollMetrics(container, {
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 100,
    })
    await flushRaf()

    const vm = wrapper.vm as unknown as {
      isAtBottom: boolean
      stickIfNeeded: () => void
    }

    container.scrollTop = 20
    container.dispatchEvent(new Event('scroll'))
    await flushRaf()
    expect(vm.isAtBottom).toBe(false)

    metrics.scrollHeight = 400
    vm.stickIfNeeded()
    expect(container.scrollTop).toBe(20)

    container.scrollTop = 300
    container.dispatchEvent(new Event('scroll'))
    expect(vm.isAtBottom).toBe(true)

    vm.stickIfNeeded()
    expect(container.scrollTop).toBe(300)
  })

  it('ignores sub-threshold upward adjustments while following', async () => {
    const wrapper = mount(StickToBottom, {
      slots: { default: '<div>content</div>' },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    const { metrics } = patchScrollMetrics(container, {
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 100,
    })
    await flushRaf()

    const vm = wrapper.vm as unknown as { isAtBottom: boolean }

    container.scrollTop = 92
    metrics.scrollHeight = 600
    container.dispatchEvent(new Event('scroll'))

    expect(vm.isAtBottom).toBe(true)
  })

  it('stops following after consecutive sub-threshold upward scrolls', async () => {
    const wrapper = mount(StickToBottom, {
      slots: { default: '<div>content</div>' },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    patchScrollMetrics(container, {
      scrollHeight: 400,
      clientHeight: 100,
      scrollTop: 300,
    })
    await flushRaf()

    const vm = wrapper.vm as unknown as { isAtBottom: boolean; stickIfNeeded: () => void }

    container.scrollTop = 294
    container.dispatchEvent(new Event('scroll'))
    expect(vm.isAtBottom).toBe(true)

    container.scrollTop = 288
    container.dispatchEvent(new Event('scroll'))
    expect(vm.isAtBottom).toBe(true)

    container.scrollTop = 282
    container.dispatchEvent(new Event('scroll'))
    await flushRaf()
    expect(vm.isAtBottom).toBe(false)

    vm.stickIfNeeded()
    expect(container.scrollTop).toBe(282)

    wrapper.unmount()
  })

  it('resets accumulated upward travel when the scroll direction reverses', async () => {
    const wrapper = mount(StickToBottom, {
      slots: { default: '<div>content</div>' },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    patchScrollMetrics(container, {
      scrollHeight: 400,
      clientHeight: 100,
      scrollTop: 300,
    })
    await flushRaf()

    const vm = wrapper.vm as unknown as { isAtBottom: boolean }

    container.scrollTop = 290
    container.dispatchEvent(new Event('scroll'))
    expect(vm.isAtBottom).toBe(true)

    container.scrollTop = 295
    container.dispatchEvent(new Event('scroll'))
    expect(vm.isAtBottom).toBe(true)

    container.scrollTop = 285
    container.dispatchEvent(new Event('scroll'))
    expect(vm.isAtBottom).toBe(true)

    container.scrollTop = 278
    container.dispatchEvent(new Event('scroll'))
    await flushRaf()
    expect(vm.isAtBottom).toBe(false)

    wrapper.unmount()
  })

  it('applies contentClass and contentStyle to the content wrapper', () => {
    const wrapper = mount(StickToBottom, {
      props: {
        contentClass: 'custom-content',
      },
      slots: { default: '<div>content</div>' },
    })

    const content = wrapper.find('.pxd-stick-to-bottom--content')
    expect(content.classes()).toContain('custom-content')
  })

  it('exposes containerRef for external scroll consumers', () => {
    const wrapper = mount(StickToBottom, {
      slots: { default: '<div>content</div>' },
    })

    const vm = wrapper.vm as unknown as { containerRef?: HTMLElement }
    expect(vm.containerRef).toBe(wrapper.find('.pxd-stick-to-bottom').element)
  })

  it('renders action slot with stick-to-bottom scope', async () => {
    const wrapper = mount(StickToBottom, {
      slots: {
        default: '<div>content</div>',
        action: `
          <template #action="{ isAtBottom, forceStickToBottom, scrollToBottom }">
            <button
              class="action-btn"
              :data-at-bottom="String(isAtBottom)"
              @click="forceStickToBottom(); scrollToBottom()"
            >
              bottom
            </button>
          </template>
        `,
      },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    patchScrollMetrics(container, {
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 100,
    })

    await nextTick()

    const action = wrapper.find('.pxd-stick-to-bottom--action .action-btn')
    expect(action.exists()).toBe(true)
    expect(action.attributes('data-at-bottom')).toBe('true')

    container.scrollTop = 0
    container.dispatchEvent(new Event('scroll'))
    await flushRaf()

    const vm = wrapper.vm as unknown as { update: () => void }
    vm.update()
    await nextTick()

    expect(action.attributes('data-at-bottom')).toBe('false')

    await action.trigger('click')
    expect(container.scrollTop).toBe(100)
  })

  it('keeps following when the pointerdown comes from the action slot', async () => {
    const wrapper = mount(StickToBottom, {
      slots: {
        default: '<div>content</div>',
        action: '<div class="action-area">bottom</div>',
      },
    })

    const container = wrapper.find('.pxd-stick-to-bottom').element as HTMLElement
    const { metrics } = patchScrollMetrics(container, {
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 100,
    })
    await flushRaf()

    const vm = wrapper.vm as unknown as { stickIfNeeded: () => void }

    wrapper
      .find('.pxd-stick-to-bottom--action .action-area')
      .element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    metrics.scrollHeight = 600

    vm.stickIfNeeded()
    expect(container.scrollTop).toBe(500)
  })
})
