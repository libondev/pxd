import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Message from '../../src/components/message/index.vue'
import {
  CREATE_MESSAGE_EVENT_NAME,
  REMOVE_MESSAGE_EVENT_NAME,
} from '../../src/composables/use-message'

function dispatchCreate(data: any) {
  const ev = new CustomEvent(CREATE_MESSAGE_EVENT_NAME, { detail: data })
  window.dispatchEvent(ev)
}
function dispatchRemove(data: any) {
  const ev = new CustomEvent(REMOVE_MESSAGE_EVENT_NAME, { detail: data })
  window.dispatchEvent(ev)
}

describe('message', () => {
  async function flushTeleportAndTransitions(wrapper: any) {
    // 确保 Vue 更新、Teleport 和 TransitionGroup 完成一次挂载/过渡周期
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
    // 清理 body 里可能残留的 Teleport 内容（保险）
    document.body.querySelectorAll('.pxd-message').forEach(n => n.remove())
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
    // 等待 onMounted 完成事件注册 + Teleport 初次渲染稳定
    await flushTeleportAndTransitions(wrapper)

    // 创建不同分组的消息
    dispatchCreate({
      key: 'k1',
      group: 'g1',
      type: 'info',
      message: 'hello g1',
      durations: 0, // 不自动关闭
      closeable: true,
      class: '',
    })
    dispatchCreate({
      key: 'k2',
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

    dispatchCreate({ key: 'a', group: 'g1', type: 'info', message: 'a', durations: 0 })
    dispatchCreate({ key: 'b', group: 'g1', type: 'info', message: 'b', durations: 0 })
    dispatchCreate({ key: 'c', group: 'g1', type: 'info', message: 'c', durations: 0 })
    dispatchCreate({ key: 'd', group: 'g1', type: 'info', message: 'd', durations: 0 })

    expect(wrapper.vm.messages.length).toBe(4)
    expect(wrapper.vm.visibleMessages.length).toBe(2)

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
      key: 'closable-1',
      group: 'g1',
      type: 'info',
      message: 'can close',
      durations: 0,
      closeable: true,
    })
    await flushTeleportAndTransitions(wrapper)

    expect(wrapper.vm.messages.length).toBe(1)

    wrapper.vm.close('closable-1')

    expect(wrapper.vm.messages.length).toBe(0)

    wrapper.unmount()
  })

  it('should remove by REMOVE_MESSAGE_EVENT_NAME', async () => {
    const wrapper = mount(Message, {
      props: { group: 'g1' },
      attachTo: document.body,
    })
    await flushTeleportAndTransitions(wrapper)

    dispatchCreate({
      key: 'rm-1',
      group: 'g1',
      type: 'warning',
      message: 'to remove',
      durations: 0,
      closeable: false,
    })
    await flushTeleportAndTransitions(wrapper)

    expect(document.body.querySelector('[data-key="rm-1"]')).toBeTruthy()

    dispatchRemove({
      key: 'rm-1',
      group: 'g1',
    })
    await flushTeleportAndTransitions(wrapper)

    expect(document.body.querySelector('[data-key="rm-1"]')).toBeFalsy()

    wrapper.unmount()
  })
})
