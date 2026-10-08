import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import ScrollProgress from '../../src/components/scroll-progress/index.vue'

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

  return metrics
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

describe('scroll-progress', () => {
  it('renders the viewport progress by default', async () => {
    const wrapper = mount(ScrollProgress)

    await flushRaf()

    expect(wrapper.find('.pxd-scroll-progress').exists()).toBe(true)
    expect(wrapper.text()).toBe('0%')
    expect(wrapper.attributes('aria-valuemin')).toBe('0')
    expect(wrapper.attributes('aria-valuemax')).toBe('100')
    expect(wrapper.attributes('aria-valuenow')).toBe('0')

    wrapper.unmount()
  })

  it('tracks a target container scroll', async () => {
    const container = document.createElement('div')
    const metrics = patchScrollMetrics(container, {
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 0,
    })

    const wrapper = mount(ScrollProgress, {
      props: {
        scrollTarget: container,
      },
    })

    await flushRaf()

    expect(wrapper.text()).toBe('0%')

    metrics.scrollTop = 100
    container.dispatchEvent(new Event('scroll'))
    await flushRaf()

    expect(wrapper.text()).toBe('50%')
    expect(wrapper.attributes('aria-valuenow')).toBe('50')
    expect(wrapper.emitted('change')?.at(-1)).toEqual([50])

    wrapper.unmount()
  })

  it('resolves a selector target', async () => {
    const container = document.createElement('div')
    container.id = 'scroll-progress-box'
    const metrics = patchScrollMetrics(container, {
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 0,
    })
    document.body.appendChild(container)

    const wrapper = mount(ScrollProgress, {
      props: {
        scrollTarget: '#scroll-progress-box',
      },
    })

    metrics.scrollTop = 200
    container.dispatchEvent(new Event('scroll'))
    await flushRaf()

    expect(wrapper.text()).toBe('100%')

    wrapper.unmount()
    container.remove()
  })

  it('clamps the percentage to 0-100', async () => {
    const container = document.createElement('div')
    const metrics = patchScrollMetrics(container, {
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 0,
    })

    const wrapper = mount(ScrollProgress, {
      props: {
        scrollTarget: container,
      },
    })

    await flushRaf()

    metrics.scrollTop = 500
    container.dispatchEvent(new Event('scroll'))
    await flushRaf()
    expect(wrapper.text()).toBe('100%')

    metrics.scrollTop = -20
    container.dispatchEvent(new Event('scroll'))
    await flushRaf()
    expect(wrapper.text()).toBe('0%')

    wrapper.unmount()
  })

  it('reports 0% when the container has no scroll range', async () => {
    const container = document.createElement('div')
    patchScrollMetrics(container, {
      scrollHeight: 100,
      clientHeight: 100,
      scrollTop: 0,
    })

    const wrapper = mount(ScrollProgress, {
      props: {
        scrollTarget: container,
      },
    })

    await flushRaf()

    expect(wrapper.text()).toBe('0%')

    wrapper.unmount()
  })

  it('renders custom content through the default slot', async () => {
    const container = document.createElement('div')
    patchScrollMetrics(container, {
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 50,
    })

    const wrapper = mount(ScrollProgress, {
      props: {
        scrollTarget: container,
      },
      slots: {
        default: '<template #default="{ percentage }">Progress: {{ percentage }}</template>',
      },
    })

    await flushRaf()

    expect(wrapper.text()).toBe('Progress: 25')

    wrapper.unmount()
  })
})
