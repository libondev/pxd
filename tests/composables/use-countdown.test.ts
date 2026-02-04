import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useCountdown } from '../../src/composables/use-countdown'

describe('useCountdown', () => {
  let mockEmits: ReturnType<typeof vi.fn>
  let mockPerformanceNow: ReturnType<typeof vi.fn>
  let mockDateNow: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockEmits = vi.fn()
    mockPerformanceNow = vi.fn()
    mockDateNow = vi.fn()

    // Mock performance.now()
    globalThis.performance = { now: mockPerformanceNow } as any

    // Mock Date.now()
    globalThis.Date.now = mockDateNow

    // 设置默认时间
    mockPerformanceNow.mockReturnValue(1000)
    mockDateNow.mockReturnValue(1000000)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should start countdown from specified durations value', () => {
    const { timestamp } = useCountdown(
      { durations: 5000, active: false, invert: false, millisecond: true },
      mockEmits,
    )
    expect(timestamp.value).toBe(5000)
  })

  it('should start countup from 0', () => {
    const { timestamp } = useCountdown({ durations: 5000, active: false, invert: true }, mockEmits)
    expect(timestamp.value).toBe(0)
  })

  it('should handle millisecond mode correctly', () => {
    const { timestamp } = useCountdown(
      { durations: 5000, millisecond: true, active: false, invert: false },
      mockEmits,
    )
    expect(timestamp.value).toBe(5000)
  })

  it('should handle second mode correctly', () => {
    const { timestamp } = useCountdown(
      { durations: 5, millisecond: false, active: false, invert: false },
      mockEmits,
    )
    expect(timestamp.value).toBe(5000)
  })

  it('should calculate countup based on end time in invert mode', () => {
    mockDateNow.mockReturnValue(1005000)
    const { timestamp } = useCountdown({ endTime: 1000000, active: false, invert: true }, mockEmits)
    expect(timestamp.value).toBe(0)
  })

  it('should handle durations of 0', () => {
    const { timestamp } = useCountdown({ durations: 0, active: false, invert: false }, mockEmits)
    expect(timestamp.value).toBe(0)
  })

  it('should handle negative durations values', () => {
    const { timestamp } = useCountdown(
      { durations: -1000, active: false, invert: false },
      mockEmits,
    )
    expect(timestamp.value).toBe(0)
  })

  it('should handle undefined durations', () => {
    const { timestamp } = useCountdown({ active: false, invert: false }, mockEmits)
    expect(timestamp.value).toBe(0)
  })

  it('should emit reset event on reset', () => {
    const { reset } = useCountdown({ durations: 5000, active: false, invert: false }, mockEmits)
    reset()
    expect(mockEmits).toHaveBeenCalledWith('reset')
  })

  it('should start countdown from specified startAt value in countdown mode', () => {
    const { timestamp } = useCountdown(
      { durations: 10000, startAt: 3000, active: false, invert: false, millisecond: true },
      mockEmits,
    )
    // 倒计时模式：从 totalDuration - startAt 开始，即 10000 - 3000 = 7000
    expect(timestamp.value).toBe(7000)
  })

  it('should start countup from specified startAt value in countup mode', () => {
    const { timestamp } = useCountdown(
      { durations: 10000, startAt: 3000, active: false, invert: true, millisecond: true },
      mockEmits,
    )
    // 正计时模式：从 startAt 开始，即 3000
    expect(timestamp.value).toBe(3000)
  })

  it('should handle startAt in second mode correctly', () => {
    const { timestamp } = useCountdown(
      { durations: 10, startAt: 3, active: false, invert: false, millisecond: false },
      mockEmits,
    )
    // 倒计时模式：从 (10*1000) - (3*1000) = 7000 开始
    expect(timestamp.value).toBe(7000)
  })

  it('should handle startAt in second mode for countup correctly', () => {
    const { timestamp } = useCountdown(
      { durations: 10, startAt: 3, active: false, invert: true, millisecond: false },
      mockEmits,
    )
    // 正计时模式：从 3*1000 = 3000 开始
    expect(timestamp.value).toBe(3000)
  })

  it('should clamp startAt to totalDuration in countup mode', () => {
    const { timestamp } = useCountdown(
      { durations: 5000, startAt: 8000, active: false, invert: true, millisecond: true },
      mockEmits,
    )
    // 正计时模式：startAt 超过 totalDuration，应该被限制为 totalDuration
    expect(timestamp.value).toBe(5000)
  })

  it('should handle startAt greater than totalDuration in countdown mode', () => {
    const { timestamp } = useCountdown(
      { durations: 5000, startAt: 8000, active: false, invert: false, millisecond: true },
      mockEmits,
    )
    // 倒计时模式：totalDuration - startAt = 5000 - 8000 = -3000，应该被限制为 0
    expect(timestamp.value).toBe(0)
  })

  it('should default startAt to 0 when not provided', () => {
    const { timestamp } = useCountdown(
      { durations: 5000, active: false, invert: false, millisecond: true },
      mockEmits,
    )
    // 没有提供 startAt，应该默认为 0，倒计时从 totalDuration 开始
    expect(timestamp.value).toBe(5000)
  })

  it('should default startAt to 0 when not provided in countup mode', () => {
    const { timestamp } = useCountdown(
      { durations: 5000, active: false, invert: true, millisecond: true },
      mockEmits,
    )
    // 没有提供 startAt，应该默认为 0，正计时从 0 开始
    expect(timestamp.value).toBe(0)
  })

  it('should support infinite countup when invert is true but durations is undefined', () => {
    const { timestamp } = useCountdown(
      { invert: true, active: false, millisecond: true },
      mockEmits,
    )
    // 正计时模式且没有设置 durations，应该从 0 开始（因为 startAt 默认为 0）
    expect(timestamp.value).toBe(0)
  })

  it('should support infinite countup with startAt when invert is true but durations is undefined', () => {
    const { timestamp } = useCountdown(
      { invert: true, startAt: 1000, active: false, millisecond: true },
      mockEmits,
    )
    // 正计时模式且没有设置 durations，应该从 startAt 开始
    expect(timestamp.value).toBe(1000)
  })
})
