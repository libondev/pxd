import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import Fader from '../../src/components/fader/index.vue'

function createScrollContainer() {
  const el = document.createElement('div')
  const metrics = {
    scrollLeft: 0,
    scrollTop: 0,
    scrollWidth: 300,
    scrollHeight: 300,
    clientWidth: 100,
    clientHeight: 100,
  }

  for (const key of Object.keys(metrics) as (keyof typeof metrics)[]) {
    Object.defineProperty(el, key, { configurable: true, get: () => metrics[key] })
  }

  document.body.appendChild(el)

  return { el, metrics }
}

function flushRaf() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

function horizontalFlags(wrapper: ReturnType<typeof mount<typeof Fader>>) {
  const item = wrapper.find('.pxd-fader--item.horizontal')

  return { left: item.classes('left'), right: item.classes('right') }
}

async function scrollTo(
  container: { el: HTMLElement; metrics: { scrollLeft: number } },
  left: number,
) {
  container.metrics.scrollLeft = left
  container.el.dispatchEvent(new Event('scroll'))
  await flushRaf()
}

describe('fader', () => {
  it('renders properly', () => {
    const wrapper = mount(Fader)

    expect(wrapper.attributes('aria-hidden')).toBe('true')

    wrapper.unmount()
  })

  it('should default direction to both', () => {
    const wrapper = mount(Fader)

    expect(wrapper.props('direction')).toBe('both')

    wrapper.unmount()
  })

  it('should accept custom direction', () => {
    const wrapper = mount(Fader, {
      props: {
        direction: 'horizontal',
      },
    })

    expect(wrapper.props('direction')).toBe('horizontal')

    wrapper.unmount()
  })

  it('should accept vertical direction', () => {
    const wrapper = mount(Fader, {
      props: {
        direction: 'vertical',
      },
    })

    expect(wrapper.props('direction')).toBe('vertical')

    wrapper.unmount()
  })

  it('should bind scroll to the container passed on mount', async () => {
    const container = createScrollContainer()
    const wrapper = mount(Fader, { props: { container: container.el } })

    await nextTick()
    await scrollTo(container, 100)

    expect(horizontalFlags(wrapper)).toEqual({ left: true, right: true })

    wrapper.unmount()
  })

  it('should rebind scroll when the container is swapped directly', async () => {
    const first = createScrollContainer()
    const second = createScrollContainer()
    const wrapper = mount(Fader, { props: { container: first.el } })

    await nextTick()
    await scrollTo(first, 0)

    expect(horizontalFlags(wrapper).left).toBe(false)

    await wrapper.setProps({ container: second.el })
    await nextTick()
    await flushRaf()
    await scrollTo(second, 100)

    expect(horizontalFlags(wrapper).left).toBe(true)

    wrapper.unmount()
  })

  it('should rebind scroll when the container passes through null', async () => {
    const first = createScrollContainer()
    const second = createScrollContainer()
    const wrapper = mount(Fader, { props: { container: first.el } })

    await nextTick()
    await scrollTo(first, 0)

    expect(horizontalFlags(wrapper).left).toBe(false)

    await wrapper.setProps({ container: null })
    await nextTick()
    await wrapper.setProps({ container: second.el })
    await nextTick()
    await flushRaf()
    await scrollTo(second, 100)

    expect(horizontalFlags(wrapper).left).toBe(true)

    wrapper.unmount()
  })

  it('should stop listening to the container it was replaced with', async () => {
    const first = createScrollContainer()
    const second = createScrollContainer()
    const wrapper = mount(Fader, { props: { container: first.el } })

    await nextTick()
    await scrollTo(first, 100)

    expect(horizontalFlags(wrapper).left).toBe(true)

    await wrapper.setProps({ container: second.el })
    await nextTick()
    await flushRaf()
    await scrollTo(first, 0)

    expect(horizontalFlags(wrapper).left).toBe(true)

    wrapper.unmount()
  })
})
