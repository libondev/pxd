import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
import Reveal from '../../src/components/reveal/index.vue'

type MockCallback = (entries: unknown[], observer: unknown) => void

interface MockInstance {
  callback: MockCallback
  targets: Set<Element>
}

/** happy-dom delivers no IntersectionObserver callback; entries are replayed by hand. */
const instances: MockInstance[] = []

class MockIntersectionObserver {
  targets = new Set<Element>()
  callback: MockCallback

  constructor(callback: MockCallback) {
    this.callback = callback
    instances.push(this)
  }

  observe(el: Element) {
    this.targets.add(el)
  }

  unobserve(el: Element) {
    this.targets.delete(el)
  }

  disconnect() {
    this.targets.clear()
  }
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

const io = {
  /** Native observers constructed so far. The pool is module state and outlives a test. */
  get count() {
    return instances.length
  },
  observedCount() {
    return instances.reduce((total, { targets }) => total + targets.size, 0)
  },
  fire(isIntersecting: boolean) {
    for (const { callback, targets } of instances) {
      callback(
        Array.from(targets).map((target) => ({ target, isIntersecting })),
        {},
      )
    }
  },
}

describe('reveal', () => {
  beforeEach(() => {
    instances.length = 0
  })

  it('renders the slot inside the host', () => {
    const wrapper = mount(Reveal, { slots: { default: 'Revealed content' } })

    expect(wrapper.text()).toContain('Revealed content')

    wrapper.unmount()
  })

  it('plays on mount without ever creating an observer', async () => {
    const wrapper = mount(Reveal)
    await nextTick()

    expect(wrapper.attributes('data-play-state')).toBe('running')
    expect(io.count).toBe(0)

    wrapper.unmount()
  })

  it('stays paused until the element intersects', async () => {
    const wrapper = mount(Reveal, { props: { trigger: 'viewport' } })

    await nextTick()
    expect(wrapper.attributes('data-play-state')).toBe('paused')

    io.fire(false)
    await nextTick()
    expect(wrapper.attributes('data-play-state')).toBe('paused')

    io.fire(true)
    await nextTick()
    expect(wrapper.attributes('data-play-state')).toBe('running')

    wrapper.unmount()
  })

  it('drops the subscription after the first reveal', async () => {
    const wrapper = mount(Reveal, { props: { trigger: 'viewport' } })

    await nextTick()
    expect(io.observedCount()).toBe(1)

    io.fire(true)
    await nextTick()

    // One-shot: the element stops being observed, so no further callback can arrive.
    expect(io.observedCount()).toBe(0)

    wrapper.unmount()
  })

  it('keeps the revealed state after the element leaves the viewport', async () => {
    const wrapper = mount(Reveal, { props: { trigger: 'viewport' } })

    await nextTick()
    io.fire(true)
    await nextTick()

    io.fire(false)
    await nextTick()

    expect(wrapper.attributes('data-play-state')).toBe('running')

    wrapper.unmount()
  })

  it('shares a single native observer across instances with equal options', async () => {
    const first = mount(Reveal, { props: { trigger: 'viewport' } })
    const second = mount(Reveal, { props: { trigger: 'viewport' } })
    const third = mount(Reveal, { props: { trigger: 'viewport' } })
    await nextTick()

    expect(io.count).toBe(1)
    expect(io.observedCount()).toBe(3)

    first.unmount()
    second.unmount()
    third.unmount()
  })

  it('never gates the element when IntersectionObserver is unavailable', async () => {
    // Mirrors a server render and any browser without the API: no observer can be
    // acquired, so a paused element would stay invisible forever.
    vi.stubGlobal('IntersectionObserver', undefined)

    const wrapper = mount(Reveal, { props: { trigger: 'viewport' } })
    await nextTick()

    expect(wrapper.attributes('data-play-state')).toBe('running')

    wrapper.unmount()
    vi.unstubAllGlobals()

    // Restore the file-level mock for the cases below.
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  it('maps time props to seconds and distance to pixels', () => {
    const wrapper = mount(Reveal, {
      props: { duration: 0.4, delay: 0.2, distance: 24 },
    })

    expect(wrapper.element.style.getPropertyValue('--reveal-duration')).toBe('0.4s')
    expect(wrapper.element.style.getPropertyValue('--reveal-delay')).toBe('0.2s')
    expect(wrapper.element.style.getPropertyValue('--reveal-distance')).toBe('24px')

    wrapper.unmount()
  })

  it('passes through time props that already carry a unit', () => {
    const wrapper = mount(Reveal, { props: { duration: '300ms', delay: '1s' } })

    expect(wrapper.element.style.getPropertyValue('--reveal-duration')).toBe('300ms')
    expect(wrapper.element.style.getPropertyValue('--reveal-delay')).toBe('1s')

    wrapper.unmount()
  })

  it('marks the host with the reveal direction', () => {
    const wrapper = mount(Reveal, { props: { direction: 'top' } })

    expect(wrapper.attributes('data-direction')).toBe('top')

    wrapper.unmount()
  })
})
