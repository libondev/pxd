import type { PluginFunc } from 'dayjs'

function replaceMillisecondToken(
  formatStr: string,
  matcher: RegExp,
  replacer: (match: string) => string,
): string {
  return formatStr.replace(matcher, replacer)
}

function padToThreeDigits(value: number): string {
  const normalized = Math.max(0, Math.min(999, Math.trunc(value)))
  return String(normalized).padStart(3, '0')
}

const millisecondTokenPlugin: PluginFunc = (_opts, DayjsClass, dayjsFactory) => {
  const processFormat = (ms: number, formatStr: string) => {
    const ms3 = padToThreeDigits(ms)
    return replaceMillisecondToken(formatStr, /S+/g, (match) => {
      const len = Math.min(match.length, 3)
      return ms3.slice(0, len)
    })
  }

  const originalFormat = DayjsClass.prototype.format
  DayjsClass.prototype.format = function (this: any, formatStr?: string) {
    if (!formatStr || typeof formatStr !== 'string') {
      return originalFormat.call(this, formatStr)
    }
    return originalFormat.call(this, processFormat(this.millisecond(), formatStr))
  }

  try {
    const isDurationInjected = typeof dayjsFactory.duration === 'function'
    if (!isDurationInjected) {
      return
    }

    const durationProto = Object.getPrototypeOf(dayjsFactory.duration(0))
    if (durationProto?.format) {
      const originalDurationFormat = durationProto.format
      durationProto.format = function (this: any, formatStr?: string) {
        if (!formatStr || typeof formatStr !== 'string') {
          return originalDurationFormat.call(this, formatStr)
        }
        return originalDurationFormat.call(this, processFormat(this.milliseconds(), formatStr))
      }
    }
  } catch {}
}

export default millisecondTokenPlugin
