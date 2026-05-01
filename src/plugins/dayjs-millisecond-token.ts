import type { PluginFunc } from 'dayjs/esm/index.js'

/**
 * Millisecond token plugin configuration options
 */
interface MillisecondTokenOptions {
  /**
   * Maximum millisecond digits (1-3)
   * @default 3
   */
  maxDigits?: number
}

/**
 * Normalize millisecond value to 0-999 range
 * @param value - Original millisecond value
 * @returns Normalized three-digit string
 */
function normalizeMilliseconds(value: number): string {
  // Handle special cases like NaN, Infinity
  if (!Number.isFinite(value)) {
    return '000'
  }

  // Normalize to 0-999 range, handle negative numbers
  const normalized = Math.max(0, Math.min(999, Math.floor(Math.abs(value))))
  return String(normalized).padStart(3, '0')
}

/**
 * Replace millisecond tokens in format string
 * @param formatStr - Format string
 * @param msValue - Normalized millisecond value string
 * @param maxDigits - Maximum digit limit
 * @returns Processed format string
 */
function replaceToken(formatStr: string, msValue: string, maxDigits: number): string {
  return formatStr.replace(/S+/g, (match) => {
    const tokenLength = match.length
    const effectiveLength = Math.min(tokenLength, maxDigits)
    return msValue.slice(0, effectiveLength)
  })
}

/**
 * Main format processing function
 * @param ms - Millisecond value
 * @param formatStr - Format string
 * @param maxDigits - Maximum digits
 * @returns Processed format string
 */
function processFormat(ms: number, formatStr: string, maxDigits: number): string {
  const msValue = normalizeMilliseconds(ms)
  return replaceToken(formatStr, msValue, maxDigits)
}

/**
 * Day.js millisecond token plugin
 * Supports S, SS, SSS tokens for millisecond formatting
 */
const millisecondTokenPlugin: PluginFunc<MillisecondTokenOptions> = (
  options,
  DayjsClass,
  dayjsFactory,
) => {
  const maxDigits = Math.max(1, Math.min(3, options?.maxDigits ?? 3))

  // eslint-disable-next-line typescript-eslint/unbound-method -- called with .call(this) later
  const originalFormat = DayjsClass.prototype.format
  // eslint-disable-next-line typescript-eslint/unbound-method -- called with .call(this) later
  const originalDurationFormat = dayjsFactory.duration?.(0)?.format

  // Wrap format function
  function wrapFormat<T extends { millisecond?: () => number; milliseconds?: () => number }>(
    original: (...args: any[]) => string,
    getMs: (instance: T) => number,
  ) {
    return function (this: T, formatStr?: string, ...args: any[]): string {
      if (!formatStr || typeof formatStr !== 'string') {
        return original.call(this, formatStr, ...args)
      }
      const ms = getMs(this)
      const processedFormat = processFormat(ms, formatStr, maxDigits)
      return original.call(this, processedFormat, ...args)
    }
  }

  // Extend Dayjs instance format
  DayjsClass.prototype.format = wrapFormat(
    originalFormat,
    (instance) => instance.millisecond?.() ?? 0,
  )

  // Extend Duration format (if available)
  try {
    if (typeof dayjsFactory.duration === 'function' && originalDurationFormat) {
      const durationProto = Object.getPrototypeOf(dayjsFactory.duration(0))
      if (durationProto?.format) {
        durationProto.format = wrapFormat(
          originalDurationFormat,
          (instance) => instance.milliseconds?.() ?? 0,
        )
      }
    }
  } catch {}
}

export default millisecondTokenPlugin
export type { MillisecondTokenOptions }
