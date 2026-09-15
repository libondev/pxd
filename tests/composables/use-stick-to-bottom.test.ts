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
    expect(wrapper.classes()).toContain('overflow-y-auto')
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
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 100,
    })

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

  it('applies contentClass and contentStyle to the content wrapper', () => {
    const wrapper = mount(StickToBottom, {
      props: {
        contentClass: 'custom-content',
        contentStyle: { height: '120px' },
      },
      slots: { default: '<div>content</div>' },
    })

    const content = wrapper.find('.pxd-stick-to-bottom--content')
    expect(content.classes()).toContain('custom-content')
    expect(content.attributes('style')).toContain('height: 120px')
  })

  it('exposes containerEl for external scroll consumers', () => {
    const wrapper = mount(StickToBottom, {
      slots: { default: '<div>content</div>' },
    })

    const vm = wrapper.vm as unknown as { containerEl?: HTMLElement }
    expect(vm.containerEl).toBe(wrapper.find('.pxd-stick-to-bottom').element)
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
})
