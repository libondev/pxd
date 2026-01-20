import dayjs from 'dayjs/esm/index.js'
import dayjsDurationPlugin from 'dayjs/esm/plugin/duration/index.js'
import dayjsMillisecondTokenPlugin from '../plugins/dayjs-millisecond-token.js'

export {
  dayjs,
  dayjsDurationPlugin,
  dayjsMillisecondTokenPlugin,
}

interface Result<T> {
  years: number[]
  months: number[]
  weeks: number[]
  dates: T[]
}

/**
 * 获取两个日期之间的所有日期
 */
export function getAllDatesBetween(
  startDate: Date | string,
  endDate: Date | string,
  format?: 'string',
): Result<string>
export function getAllDatesBetween(
  startDate: Date | string,
  endDate: Date | string,
  format?: 'object',
): Result<Date>
export function getAllDatesBetween(
  startDate: Date | string,
  endDate: Date | string,
  format: 'string' | 'object' = 'string',
): Result<string | Date> {
  const start = dayjs(startDate)
  const end = dayjs(endDate)

  // 验证日期
  if (!start.isValid() || !end.isValid()) {
    throw new TypeError('无效的日期输入')
  }

  // 确保开始日期不晚于结束日期
  const startDateNormalized = start.isAfter(end) ? end : start
  const endDateNormalized = start.isAfter(end) ? start : end

  // 使用 dayjs 计算日期差（天数）
  const startOfStart = startDateNormalized.startOf('day')
  const startOfEnd = endDateNormalized.startOf('day')
  const daysDiff = startOfEnd.diff(startOfStart, 'day')

  // 使用 dayjs 生成所有日期数组
  const dates = Array.from({ length: daysDiff + 1 }, (_, index) => {
    return startOfStart.add(index, 'day')
  })

  // 使用 dayjs 提取年份、月份和周几信息
  const yearsSet = new Set<number>()
  const monthsSet = new Set<number>()
  const weeksSet = new Set<number>()

  dates.forEach((date) => {
    yearsSet.add(date.year())
    monthsSet.add(date.month() + 1)
    weeksSet.add(date.day())
  })

  // 格式化日期数组
  const formattedDates = dates.map((date) => {
    return format === 'object' ? date.toDate() : date.format('YYYY-MM-DD')
  })

  return {
    years: Array.from(yearsSet),
    months: Array.from(monthsSet),
    weeks: Array.from(weeksSet),
    dates: formattedDates,
  }
}

/**
 * 获取指定年月的天数、第一天是周几、最后一天是周几
 * @param year 年份
 * @param month 月份
 * @returns 天数、第一天是周几、最后一天是周几
 */
export function getMonthDays(year: number, month: number) {
  const firstDay = dayjs().year(year).month(month - 1).date(1)
  const lastDay = firstDay.endOf('month')

  return {
    days: lastDay.date(),
    firstDay: firstDay.day(),
    lastDay: lastDay.day(),
  }
}
