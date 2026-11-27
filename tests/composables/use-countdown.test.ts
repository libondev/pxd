import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick, ref } from 'vue'
import { useCountdown } from '../../src/composables/use-countdown'
import { runWithScope } from '../helpers/setup'

describe('useCountdown', () => {
  let mockPerformanceNow: ReturnType<typeof vi.fn> & (() => number)
  let mockDateNow: ReturnType<typeof vi.fn>

  beforeEach(() => {
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

  it('should start countdown from specified duration value', () => {
    const { result, stop } = runWithScope(() =>
      useCountdown({ duration: 5000, enabled: false, countUp: false }),
    )
    expect(result.timestamp.value).toBe(5000)
    stop()
  })

  it('should start countup from 0', () => {
    const { result, stop } = runWithScope(() =>
      useCountdown({ duration: 5000, enabled: false, countUp: true }),
    )
    expect(result.timestamp.value).toBe(0)
    stop()
  })

  it('should calculate countup based on end time in countUp mode', () => {
    mockDateNow.mockReturnValue(1005000)
    const { result, stop } = runWithScope(() =>
      useCountdown({ endTime: 1000000, enabled: false, countUp: true }),
    )
    expect(result.timestamp.value).toBe(0)
    stop()
  })

  it('should handle duration of 0', () => {
    const { result, stop } = runWithScope(() =>
      useCountdown({ duration: 0, enabled: false, countUp: false }),
    )
    expect(result.timestamp.value).toBe(0)
    stop()
  })

  it('should handle negative duration values', () => {
    const { result, stop } = runWithScope(() =>
      useCountdown({ duration: -1000, enabled: false, countUp: false }),
    )
    expect(result.timestamp.value).toBe(0)
    stop()
  })

  it('should handle undefined duration', () => {
    const { result, stop } = runWithScope(() => useCountdown({ enabled: false, countUp: false }))
    expect(result.timestamp.value).toBe(0)
    stop()
  })

  it('should call onReset when reset', () => {
    const onReset = vi.fn()
    const { result, stop } = runWithScope(() =>
      useCountdown({ duration: 5000, enabled: false, countUp: false, onReset }),
    )
    result.reset()
    expect(onReset).toHaveBeenCalledTimes(1)
    stop()
  })

  it('should call onChange with the initial enabled state', () => {
    const onChange = vi.fn()
    const { stop } = runWithScope(() => useCountdown({ enabled: false, onChange }))
    expect(onChange).toHaveBeenCalledWith(false)
    stop()
  })

  it('should read reactive options', async () => {
    const duration = ref(5000)
    const { result, stop } = runWithScope(() => useCountdown({ duration, enabled: false }))
    expect(result.timestamp.value).toBe(5000)

    duration.value = 3000
    await nextTick()
    expect(result.timestamp.value).toBe(3000)
    stop()
  })

  it('should react to enabled changes', async () => {
    const enabled = ref(false)
    const onChange = vi.fn()
    const { stop } = runWithScope(() => useCountdown({ duration: 5000, enabled, onChange }))
    expect(onChange).toHaveBeenLastCalledWith(false)

    enabled.value = true
    await nextTick()
    expect(onChange).toHaveBeenLastCalledWith(true)
    stop()
  })

  it('should call onFinish when the countdown reaches zero', () => {
    const onFinish = vi.fn()
    const { stop } = runWithScope(() => useCountdown({ duration: 0, enabled: true, onFinish }))
    expect(onFinish).toHaveBeenCalledTimes(1)
    stop()
  })

  it('should start countdown from specified startAt value in countdown mode', () => {
    const { result, stop } = runWithScope(() =>
      useCountdown({
        duration: 10000,
        startAt: 3000,
        enabled: false,
        countUp: false,
      }),
    )
    expect(result.timestamp.value).toBe(7000)
    stop()
  })

  it('should start countup from specified startAt value in countup mode', () => {
    const { result, stop } = runWithScope(() =>
      useCountdown({
        duration: 10000,
        startAt: 3000,
        enabled: false,
        countUp: true,
      }),
    )
    expect(result.timestamp.value).toBe(3000)
    stop()
  })

  it('should subtract startAt from duration in countdown mode', () => {
    const { result, stop } = runWithScope(() =>
      useCountdown({
        duration: 10000,
        startAt: 3000,
        enabled: false,
        countUp: false,
      }),
    )
    expect(result.timestamp.value).toBe(7000)
    stop()
  })

  it('should start from startAt in countup mode', () => {
    const { result, stop } = runWithScope(() =>
      useCountdown({
        duration: 10000,
        startAt: 3000,
        enabled: false,
        countUp: true,
      }),
    )
    expect(result.timestamp.value).toBe(3000)
    stop()
  })

  it('should clamp startAt to totalDuration in countup mode', () => {
    const { result, stop } = runWithScope(() =>
      useCountdown({
        duration: 5000,
        startAt: 8000,
        enabled: false,
        countUp: true,
      }),
    )
    expect(result.timestamp.value).toBe(5000)
    stop()
  })

  it('should handle startAt greater than totalDuration in countdown mode', () => {
    const { result, stop } = runWithScope(() =>
      useCountdown({
        duration: 5000,
        startAt: 8000,
        enabled: false,
        countUp: false,
      }),
    )
    expect(result.timestamp.value).toBe(0)
    stop()
  })

  it('should default startAt to 0 when not provided', () => {
    const { result, stop } = runWithScope(() =>
      useCountdown({ duration: 5000, enabled: false, countUp: false }),
    )
    expect(result.timestamp.value).toBe(5000)
    stop()
  })

  it('should default startAt to 0 when not provided in countup mode', () => {
    const { result, stop } = runWithScope(() =>
      useCountdown({ duration: 5000, enabled: false, countUp: true }),
    )
    expect(result.timestamp.value).toBe(0)
    stop()
  })

  it('should support infinite countup when countUp is true but duration is undefined', () => {
    const { result, stop } = runWithScope(() => useCountdown({ countUp: true, enabled: false }))
    expect(result.timestamp.value).toBe(0)
    stop()
  })

  it('should support infinite countup with startAt when countUp is true but duration is undefined', () => {
    const { result, stop } = runWithScope(() =>
      useCountdown({ countUp: true, startAt: 1000, enabled: false }),
    )
    expect(result.timestamp.value).toBe(1000)
    stop()
  })
})
