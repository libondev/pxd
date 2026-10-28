import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import Backtop from '../../src/components/backtop/index.vue'

async function flushFrames() {
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
}

describe('backtop', () => {
  it('renders properly', () => {
    const wrapper = mount(Backtop)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should set default visibleThreshold', () => {
    const wrapper = mount(Backtop)

    expect(wrapper.props('visibleThreshold')).toBe(30)

    wrapper.unmount()
  })

  it('should set custom visibleThreshold', () => {
    const wrapper = mount(Backtop, {
      props: {
        visibleThreshold: 100,
      },
    })

    expect(wrapper.props('visibleThreshold')).toBe(100)

    wrapper.unmount()
  })

  it('should set appendToBody default', () => {
    const wrapper = mount(Backtop)

    expect(wrapper.props('appendToBody')).toBe(true)

    wrapper.unmount()
  })

  it('should set scrollTarget default', () => {
    const wrapper = mount(Backtop)

    expect(wrapper.props('scrollTarget')).toBe('top')

    wrapper.unmount()
  })

  it('re-measures when the scroll range changes without a scroll event', async () => {
    const host = document.createElement('div')
    const content = document.createElement('div')

    // An inline overflow makes this the scroll target; happy-dom has no layout, so the metrics
    // are stubbed on it the same way the scroll-driven tests do
    host.style.overflowY = 'auto'
    host.appendChild(content)
    document.body.appendChild(host)

    const metrics = { scrollHeight: 200, clientHeight: 100, scrollTop: 100 }

    Object.defineProperties(host, {
      scrollHeight: { configurable: true, get: () => metrics.scrollHeight },
      clientHeight: { configurable: true, get: () => metrics.clientHeight },
      scrollTop: {
        configurable: true,
        get: () => metrics.scrollTop,
        set: (value: number) => {
          metrics.scrollTop = value
        },
      },
    })

    const wrapper = mount(Backtop, {
      props: { appendToBody: false, scrollTarget: 'bottom', visibleThreshold: 30 },
      attachTo: host,
    })
    await flushFrames()

    const backtop = host.querySelector('[data-backtop]') as HTMLElement

    // At the bottom: hidden, and the range has not been seen changing yet
    expect(backtop.style.display).toBe('none')

    // A panel expands above: the range grows, no scroll event and no container box change
    metrics.scrollHeight = 600
    content.setAttribute('style', 'height: 600px')
    await flushFrames()

    expect(backtop.style.display).not.toBe('none')

    wrapper.unmount()
    host.remove()
  })
})
