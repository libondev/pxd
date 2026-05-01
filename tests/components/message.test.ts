import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import Message from '../../src/components/message/index.vue'
import { UPDATE_MESSAGE_EVENT_NAME } from '../../src/composables/use-message'

function dispatchCreate(data: any) {
  const ev = new CustomEvent(UPDATE_MESSAGE_EVENT_NAME, {
    detail: { type: 'create', group: data.group, data },
  })
  window.dispatchEvent(ev)
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
})
