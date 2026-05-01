import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { useCountdown } from '../../src/composables/use-countdown'

describe('useCountdown', () => {
  type EmitFn = (event: string, ...args: any[]) => void

  let mockEmits: ReturnType<typeof vi.fn> & EmitFn
  let mockPerformanceNow: ReturnType<typeof vi.fn> & (() => number)
  let mockDateNow: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockEmits = vi.fn<EmitFn>() as unknown as ReturnType<typeof vi.fn> & EmitFn
    mockPerformanceNow = vi.fn<() => number>() as unknown as ReturnType<typeof vi.fn> &
      (() => number)

    // Mock performance.now()
    vi.stubGlobal('performance', { now: mockPerformanceNow } as unknown as Performance)

    // Mock Date.now()
    mockDateNow = vi.spyOn(Date, 'now')

    mockPerformanceNow.mockReturnValue(1000)
    mockDateNow.mockReturnValue(1000000)
  })

  afterEach(() => {
    mockDateNow?.mockRestore()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
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
    expect(timestamp.value).toBe(7000)
  })

  it('should start countup from specified startAt value in countup mode', () => {
    const { timestamp } = useCountdown(
      { durations: 10000, startAt: 3000, active: false, invert: true, millisecond: true },
      mockEmits,
    )
    expect(timestamp.value).toBe(3000)
  })

  it('should handle startAt in second mode correctly', () => {
    const { timestamp } = useCountdown(
      { durations: 10, startAt: 3, active: false, invert: false, millisecond: false },
      mockEmits,
    )
    expect(timestamp.value).toBe(7000)
  })

  it('should handle startAt in second mode for countup correctly', () => {
    const { timestamp } = useCountdown(
      { durations: 10, startAt: 3, active: false, invert: true, millisecond: false },
      mockEmits,
    )
    expect(timestamp.value).toBe(3000)
  })

  it('should clamp startAt to totalDuration in countup mode', () => {
    const { timestamp } = useCountdown(
      { durations: 5000, startAt: 8000, active: false, invert: true, millisecond: true },
      mockEmits,
    )
    expect(timestamp.value).toBe(5000)
  })

  it('should handle startAt greater than totalDuration in countdown mode', () => {
    const { timestamp } = useCountdown(
      { durations: 5000, startAt: 8000, active: false, invert: false, millisecond: true },
      mockEmits,
    )
    expect(timestamp.value).toBe(0)
  })

  it('should default startAt to 0 when not provided', () => {
    const { timestamp } = useCountdown(
      { durations: 5000, active: false, invert: false, millisecond: true },
      mockEmits,
    )
    expect(timestamp.value).toBe(5000)
  })

  it('should default startAt to 0 when not provided in countup mode', () => {
    const { timestamp } = useCountdown(
      { durations: 5000, active: false, invert: true, millisecond: true },
      mockEmits,
    )
    expect(timestamp.value).toBe(0)
  })

  it('should support infinite countup when invert is true but durations is undefined', () => {
    const { timestamp } = useCountdown(
      { invert: true, active: false, millisecond: true },
      mockEmits,
    )
    expect(timestamp.value).toBe(0)
  })

  it('should support infinite countup with startAt when invert is true but durations is undefined', () => {
    const { timestamp } = useCountdown(
      { invert: true, startAt: 1000, active: false, millisecond: true },
      mockEmits,
    )
    expect(timestamp.value).toBe(1000)
  })
})
