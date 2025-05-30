/* eslint-disable no-unmodified-loop-condition */

interface Result<T> {
  years: number[]
  months: number[]
  weeks: number[]
  dates: T[]
}

function getYMDDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
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
  // 确保输入是Date对象
  let start = startDate instanceof Date ? startDate : new Date(startDate)
  let end = endDate instanceof Date ? endDate : new Date(endDate)

  // 验证日期
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new TypeError('无效的日期输入')
  }

  // 如果开始日期大于结束日期，则交换它们
  if (start > end) {
    [start, end] = [end, start]
  }

  const years = new Set<number>()
  const months = new Set<number>()
  const weeks = new Set<number>()
  const dates = []
  const currentDate = new Date(start)

  // 设置时间为00:00:00以避免时区问题
  currentDate.setHours(0, 0, 0, 0)
  const endDateTime = new Date(end)
  endDateTime.setHours(0, 0, 0, 0)

  // 循环直到到达结束日期
  while (currentDate <= endDateTime) {
    years.add(currentDate.getFullYear())
    months.add(currentDate.getMonth() + 1)
    weeks.add(currentDate.getDay())

    dates.push(
      format === 'object'
        ? new Date(currentDate)
        : getYMDDateString(currentDate), // YYYY-MM-DD
    )

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return {
    years: Array.from(years),
    months: Array.from(months),
    weeks: Array.from(weeks),
    dates,
  }
}

/**
 * 获取指定年月的天数、第一天是周几、最后一天是周几
 * @param year 年份
 * @param month 月份
 * @returns 天数、第一天是周几、最后一天是周几
 */
export function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  return {
    days: lastDay.getDate(),
    firstDay: firstDay.getDay(),
    lastDay: lastDay.getDay(),
  }
}
