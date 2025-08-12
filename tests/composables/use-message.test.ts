import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearGroup, clearMessageAll, configureMessages, messages, pauseMessage, resumeMessage, useMessage } from '../../src/composables/use-message'

describe('use-message', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2020-01-01T00:00:00Z'))
    // 重置配置到安全默认值
    configureMessages({
      maxTotal: 300,
      maxPerGroup: 50,
      maxPersistentPerGroup: 50,
      minImmediateCloseMs: 100,
    })
    clearMessageAll()
  })

  afterEach(() => {
    clearMessageAll()
    vi.useRealTimers()
  })

  it('should auto close after durations', () => {
    useMessage('auto', { key: 'k1', group: 'g1', durations: 1000 })
    expect(messages.value.length).toBe(1)

    vi.advanceTimersByTime(999)
    expect(messages.value.length).toBe(1)

    vi.advanceTimersByTime(1)
    expect(messages.value.length).toBe(0)
  })

  it('should persist when durations is 0', () => {
    useMessage('persist', { key: 'k2', group: 'g1', durations: 0 })
    expect(messages.value.length).toBe(1)

    vi.advanceTimersByTime(10_000)
    expect(messages.value.length).toBe(1)
  })

  it('should pause on hover and resume with remaining time', () => {
    useMessage('hover', { key: 'k3', group: 'g1', durations: 1000 })
    expect(messages.value.length).toBe(1)

    // 经过 400ms 后暂停
    vi.advanceTimersByTime(400)
    pauseMessage('k3')

    // 时间继续前进，也不会被关闭
    vi.advanceTimersByTime(5_000)
    expect(messages.value.length).toBe(1)

    // 恢复后应再经过约 600ms 才关闭
    resumeMessage('k3')
    vi.advanceTimersByTime(599)
    expect(messages.value.length).toBe(1)

    vi.advanceTimersByTime(1)
    expect(messages.value.length).toBe(0)
  })

  it('should close immediately on resume when remaining below threshold', () => {
    configureMessages({ minImmediateCloseMs: 100 })
    useMessage('short', { key: 'k4', group: 'g1', durations: 100 })
    expect(messages.value.length).toBe(1)

    // 经过 95ms 后暂停，剩余约 5ms（<=100）
    vi.advanceTimersByTime(95)
    pauseMessage('k4')

    // 恢复时由于剩余时间很短，应立即关闭
    resumeMessage('k4')
    expect(messages.value.length).toBe(0)
  })

  it('should enforce maxPerGroup by removing oldest in the group', () => {
    configureMessages({ maxPerGroup: 2, maxTotal: 100, maxPersistentPerGroup: 50 })
    clearMessageAll()

    useMessage('a', { key: 'g1-1', group: 'g1', durations: 0 })
    useMessage('b', { key: 'g1-2', group: 'g1', durations: 0 })
    useMessage('c', { key: 'g1-3', group: 'g1', durations: 0 })

    const keys = new Set(messages.value.map(m => m.key))
    expect(keys.has('g1-1')).toBe(false)
    expect(keys.has('g1-2')).toBe(true)
    expect(keys.has('g1-3')).toBe(true)
    expect(messages.value.length).toBe(2)
  })

  it('should enforce maxPersistentPerGroup by removing oldest persistent message', () => {
    configureMessages({ maxPerGroup: 100, maxPersistentPerGroup: 1 })
    clearMessageAll()

    useMessage('p1', { key: 'p-1', group: 'g2', durations: 0 })
    useMessage('p2', { key: 'p-2', group: 'g2', durations: 0 })

    const keys = new Set(messages.value.map(m => m.key))
    expect(keys.has('p-1')).toBe(false)
    expect(keys.has('p-2')).toBe(true)
    expect(messages.value.length).toBe(1)
  })

  it('should clear group', () => {
    clearMessageAll()
    useMessage('a', { key: 'ga-1', group: 'ga', durations: 0 })
    useMessage('b', { key: 'ga-2', group: 'ga', durations: 0 })
    useMessage('c', { key: 'gb-1', group: 'gb', durations: 0 })

    clearGroup('ga')
    const keys = new Set(messages.value.map(m => m.key))
    expect(keys.has('ga-1')).toBe(false)
    expect(keys.has('ga-2')).toBe(false)
    expect(keys.has('gb-1')).toBe(true)
    expect(messages.value.length).toBe(1)
  })

  it('should clear all', () => {
    clearMessageAll()
    useMessage('a', { key: 'x1', group: 'g', durations: 0 })
    useMessage('b', { key: 'x2', group: 'g', durations: 0 })
    expect(messages.value.length).toBe(2)

    clearMessageAll()
    expect(messages.value.length).toBe(0)
  })
})
