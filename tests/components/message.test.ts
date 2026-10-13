import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { h } from 'vue'
import Message from '../../src/components/message/index.vue'
import { UPDATE_MESSAGE_EVENT_NAME } from '../../src/composables/use-message'

function dispatchCreate(data: any) {
  const ev = new CustomEvent(UPDATE_MESSAGE_EVENT_NAME, {
    detail: { type: 'create', group: data.group, data },
  })
  window.dispatchEvent(ev)
}

function messageSection() {
  return document.body.querySelector('section[data-message]')!
}

function dispatchPointerEnter() {
  const group = document.body.querySelector('transition-group-stub') ?? document.body.querySelector('ol')

  group?.dispatchEvent(new Event('pointerenter', { bubbles: true }))
}

function setDocumentHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
  document.dispatchEvent(new Event('visibilitychange'))
}

async function flushPromises(times = 8) {
  for (let i = 0; i < times; i++) {
    await Promise.resolve()
  }
}

describe('message', () => {
  async function flushTeleportAndTransitions(wrapper: any) {
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(0)
    await Promise.resolve()
    await wrapper.vm.$nextTick()
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    document.body.querySelectorAll('.pxd-message').forEach((n) => n.remove())
  })

  it('should render messages created via window event and respect group', async () => {
    const wrapper = mount(Message, {
      props: {
        group: 'g1',
        max: 5,
        position: 'top',
        zIndex: 999,
      },
      attachTo: document.body,
    })
    await flushTeleportAndTransitions(wrapper)

    dispatchCreate({
      id: 'k1',
      group: 'g1',
      type: 'info',
      message: 'hello g1',
      durations: 0,
      closeable: true,
      class: '',
    })
    dispatchCreate({
      id: 'k2',
      group: 'g2',
      type: 'success',
      message: 'hello g2',
      durations: 0,
      closeable: true,
      class: '',
    })

    expect(wrapper.vm.messages.length).toBe(1)

    wrapper.unmount()
  })

  it('should cap visible list by max (slice last N)', async () => {
    const wrapper = mount(Message, {
      props: {
        group: 'g1',
        max: 2,
      },
      attachTo: document.body,
    })

    dispatchCreate({ id: 'a', group: 'g1', type: 'info', message: 'a', durations: 0 })
    dispatchCreate({ id: 'b', group: 'g1', type: 'info', message: 'b', durations: 0 })
    dispatchCreate({ id: 'c', group: 'g1', type: 'info', message: 'c', durations: 0 })
    dispatchCreate({ id: 'd', group: 'g1', type: 'info', message: 'd', durations: 0 })

    expect(wrapper.vm.messages.length).toBe(4)

    wrapper.unmount()
  })

  it('should close by clicking close button when closeable', async () => {
    const wrapper = mount(Message, {
      props: {
        group: 'g1',
      },
      attachTo: document.body,
    })
    await flushTeleportAndTransitions(wrapper)

    dispatchCreate({
      id: 'closeable-1',
      group: 'g1',
      type: 'info',
      message: 'can close',
      durations: 0,
      closeable: true,
    })
    await flushTeleportAndTransitions(wrapper)

    expect(wrapper.vm.messages.length).toBe(1)

    wrapper.vm.close('closeable-1')

    expect(wrapper.vm.messages.length).toBe(0)

    wrapper.unmount()
  })

  it('should keep a pending promise message alive across pause/resume', async () => {
    const wrapper = mount(Message, { props: { group: 'g1' }, attachTo: document.body })

    dispatchCreate({
      id: 'pending',
      group: 'g1',
      type: 'loading',
      message: 'Saving...',
      durations: 3000,
      promise: new Promise(() => {}),
    })
    await wrapper.vm.$nextTick()

    wrapper.vm.pause('pending')
    wrapper.vm.resume('pending')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.messages.length).toBe(1)

    wrapper.unmount()
  })

  it('should not double-subtract remaining time on repeated pause', async () => {
    const wrapper = mount(Message, { props: { group: 'g1' }, attachTo: document.body })

    dispatchCreate({ id: 'paused', group: 'g1', type: 'info', message: 'x', durations: 3000 })
    await wrapper.vm.$nextTick()

    vi.advanceTimersByTime(1000)
    wrapper.vm.pause('paused')
    expect(wrapper.vm.messages[0]._remainingMs).toBe(2000)

    vi.advanceTimersByTime(1000)
    wrapper.vm.pause('paused')
    expect(wrapper.vm.messages[0]._remainingMs).toBe(2000)

    wrapper.unmount()
  })

  it('should resume every paused message when the tab becomes visible', async () => {
    const wrapper = mount(Message, { props: { group: 'g1', max: 5 }, attachTo: document.body })

    dispatchCreate({ id: 'ra', group: 'g1', type: 'info', message: 'a', durations: 3000 })
    dispatchCreate({ id: 'rb', group: 'g1', type: 'info', message: 'b', durations: 3000 })
    await wrapper.vm.$nextTick()

    // leaves both messages with 100ms left, which resume closes directly
    vi.advanceTimersByTime(2900)
    setDocumentHidden(true)
    setDocumentHidden(false)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.messages.length).toBe(0)

    wrapper.unmount()
  })

  it('should measure the item height after its text updates', async () => {
    const proto = window.HTMLElement.prototype as any
    const original = Object.getOwnPropertyDescriptor(proto, 'offsetHeight')

    Object.defineProperty(proto, 'offsetHeight', {
      configurable: true,
      get() {
        return String(this.textContent || '').length
      },
    })

    try {
      const wrapper = mount(Message, { props: { group: 'g1' }, attachTo: document.body })

      dispatchCreate({ id: 'sized', group: 'g1', type: 'info', message: 'hello', durations: 0 })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.messages[0].height).toBe(5)

      wrapper.vm.messages[0].message = 'hello world!!!'
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.messages[0].height).toBe(14)

      wrapper.unmount()
    } finally {
      if (original) {
        Object.defineProperty(proto, 'offsetHeight', original)
      }
    }
  })

  it('should apply a VNode returned from a promise handler', async () => {
    const wrapper = mount(Message, { props: { group: 'g1' }, attachTo: document.body })

    dispatchCreate({
      id: 'vnode',
      group: 'g1',
      type: 'loading',
      message: 'orig',
      durations: 0,
      promise: Promise.resolve(1),
      success: () => h('b', 'rendered'),
    })
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(document.body.innerHTML).toContain('<b>rendered</b>')

    wrapper.unmount()
  })

  it('should not schedule a timer for a message closed before its promise settles', async () => {
    const wrapper = mount(Message, { props: { group: 'g1' }, attachTo: document.body })

    let settlePromise: (value: unknown) => void

    dispatchCreate({
      id: 'dropped',
      group: 'g1',
      type: 'loading',
      message: 'wait',
      durations: 3000,
      promise: new Promise((resolve) => {
        settlePromise = resolve
      }),
    })
    await wrapper.vm.$nextTick()

    wrapper.vm.close('dropped')
    settlePromise!(1)
    await flushPromises()

    expect(vi.getTimerCount()).toBe(0)

    wrapper.unmount()
  })

  it('should still auto close a promise message once it settles', async () => {
    const wrapper = mount(Message, { props: { group: 'g1' }, attachTo: document.body })

    dispatchCreate({
      id: 'settled',
      group: 'g1',
      type: 'loading',
      message: 'wait',
      durations: 3000,
      promise: Promise.resolve(1),
    })
    await flushPromises()

    expect(wrapper.vm.messages.length).toBe(1)

    vi.advanceTimersByTime(3000)
    expect(wrapper.vm.messages.length).toBe(0)

    wrapper.unmount()
  })

  it('should keep messages past max out of flow', async () => {
    const wrapper = mount(Message, {
      props: { group: 'g1', max: 2, expand: true },
      attachTo: document.body,
    })

    dispatchCreate({ id: 'oa', group: 'g1', type: 'info', message: 'a', durations: 0 })
    dispatchCreate({ id: 'ob', group: 'g1', type: 'info', message: 'b', durations: 0 })
    dispatchCreate({ id: 'oc', group: 'g1', type: 'info', message: 'c', durations: 0 })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const items = [...document.body.querySelectorAll('[data-message-item]')] as HTMLElement[]

    expect(items.map((el) => el.getAttribute('data-index'))).toEqual(['0', '1', '2'])
    expect(items.map((el) => el.style.position)).toEqual(['', '', 'absolute'])

    wrapper.unmount()
  })

  it('should collapse after clear()', async () => {
    const wrapper = mount(Message, { props: { group: 'g1' }, attachTo: document.body })

    dispatchCreate({ id: 'cleared', group: 'g1', type: 'info', message: 'c', durations: 0 })
    await wrapper.vm.$nextTick()

    dispatchPointerEnter()
    await wrapper.vm.$nextTick()
    expect(messageSection().getAttribute('data-expand')).toBe('true')

    wrapper.vm.clear()
    await wrapper.vm.$nextTick()

    expect(messageSection().getAttribute('data-expand')).toBe('false')

    wrapper.unmount()
  })

  it('should stay expanded after clear() when expand is enabled', async () => {
    const wrapper = mount(Message, { props: { group: 'g1', expand: true }, attachTo: document.body })

    dispatchCreate({ id: 'expanded', group: 'g1', type: 'info', message: 'c', durations: 0 })
    await wrapper.vm.$nextTick()

    wrapper.vm.clear()
    await wrapper.vm.$nextTick()

    expect(messageSection().getAttribute('data-expand')).toBe('true')

    wrapper.unmount()
  })
})
