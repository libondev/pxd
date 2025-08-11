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
    const { timestamp } = useCountdown(
      { durations: 5000, active: false, invert: true },
      mockEmits,
    )
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
    const { timestamp } = useCountdown(
      { endTime: 1000000, active: false, invert: true },
      mockEmits,
    )
    expect(timestamp.value).toBe(0)
  })

  it('should normalize 10-digit end time correctly', () => {
    mockDateNow.mockReturnValue(1000000000000)
    const { timestamp } = useCountdown(
      { endTime: 1000000005, active: false, invert: false },
      mockEmits,
    )
    expect(timestamp.value).toBe(5000)
  })

  it('should normalize 13-digit end time correctly', () => {
    mockDateNow.mockReturnValue(1000000000000)
    const { timestamp } = useCountdown(
      { endTime: 1000000005000, active: false, invert: false },
      mockEmits,
    )
    expect(timestamp.value).toBe(5000)
  })

  it('should handle durations of 0', () => {
    const { timestamp } = useCountdown(
      { durations: 0, active: false, invert: false },
      mockEmits,
    )
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
    const { timestamp } = useCountdown(
      { active: false, invert: false },
      mockEmits,
    )
    expect(timestamp.value).toBe(0)
  })

  it('should emit reset event on reset', () => {
    const { reset } = useCountdown(
      { durations: 5000, active: false, invert: false },
      mockEmits,
    )
    reset()
    expect(mockEmits).toHaveBeenCalledWith('reset')
  })
})
