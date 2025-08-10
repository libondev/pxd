import type { PluginFunc } from 'dayjs'

function padToThreeDigits(value: number): string {
  const normalized = Math.max(0, Math.min(999, Math.trunc(value)))
  return String(normalized).padStart(3, '0')
}

function replaceUnescapedTokens(
  formatStr: string,
  matcher: RegExp,
  replacer: (match: string) => string,
): string {
  let result = ''
  let index = 0
  const length = formatStr.length

  while (index < length) {
    const char = formatStr[index]
    if (char === '[') {
      // Preserve escaped literal content inside square brackets
      const end = formatStr.indexOf(']', index + 1)
      if (end === -1) {
        // No closing bracket; treat the rest as normal text
        const segment = formatStr.slice(index)
        result += segment.replace(matcher, replacer)
        break
      } else {
        result += formatStr.slice(index, end + 1)
        index = end + 1
      }
    } else {
      const nextBracket = formatStr.indexOf('[', index)
      const end = nextBracket === -1 ? length : nextBracket
      const segment = formatStr.slice(index, end)
      result += segment.replace(matcher, replacer)
      index = end
    }
  }

  return result
}

const millisecondTokenPlugin: PluginFunc = (_opts, DayjsClass, dayjsFactory) => {
  // Patch Dayjs.prototype.format to support S / SS (1 or 2 digits of milliseconds)
  const originalDateTimeFormat = DayjsClass.prototype.format

  DayjsClass.prototype.format = function patchedFormat(this: any, formatStr?: string) {
    if (!formatStr || typeof formatStr !== 'string') {
      return originalDateTimeFormat.call(this, formatStr)
    }

    const ms3 = padToThreeDigits(typeof this.millisecond === 'function' ? this.millisecond() : 0)

    // Replace only when token length is 1 or 2; keep SSS (or longer) untouched
    const prepared = replaceUnescapedTokens(
      formatStr,
      /S+/g,
      (match) => {
        if (match.length === 1) {
          return ms3.slice(0, 1)
        }
        if (match.length === 2) {
          return ms3.slice(0, 2)
        }
        if (match.length === 3) {
          return ms3
        }
        return match
      },
    )

    return originalDateTimeFormat.call(this, prepared)
  }

  // Patch Duration.prototype.format (if duration plugin is present)
  try {
    const hasDuration = typeof dayjsFactory.duration === 'function'
    if (hasDuration) {
      const durationInstance = dayjsFactory.duration(0)
      const durationProto = Object.getPrototypeOf(durationInstance)
      if (durationProto && typeof durationProto.format === 'function') {
        const originalDurationFormat = durationProto.format
        durationProto.format = function patchedDurationFormat(this: any, formatStr?: string) {
          if (!formatStr || typeof formatStr !== 'string') {
            return originalDurationFormat.call(this, formatStr)
          }

          const ms3 = padToThreeDigits(typeof this.milliseconds === 'function' ? this.milliseconds() : 0)
          const prepared = replaceUnescapedTokens(
            formatStr,
            /S+/g,
            (match) => {
              if (match.length === 1) {
                return ms3.slice(0, 1)
              }
              if (match.length === 2) {
                return ms3.slice(0, 2)
              }
              if (match.length === 3) {
                return ms3
              }
              return match
            },
          )

          return originalDurationFormat.call(this, prepared)
        }
      }
    }
  } catch {
    // Silently ignore if duration plugin is not available
  }
}

export default millisecondTokenPlugin
