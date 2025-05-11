/* eslint-disable no-unmodified-loop-condition */

interface Result<T> {
  years: string[]
  months: string[]
  weeks: string[]
  dates: T[]
}

/**
 * 获取两个日期之间的所有日期
 */
export function getAllDatesBetween(
  startDate: Date | string,
  endDate: Date | string,
  format?: 'string',
  isIncludeEnd?: boolean,
): Result<string>
export function getAllDatesBetween(
  startDate: Date | string,
  endDate: Date | string,
  format?: 'object',
  isIncludeEnd?: boolean,
): Result<Date>
export function getAllDatesBetween(
  startDate: Date | string,
  endDate: Date | string,
  format: 'string' | 'object' = 'string',
  isIncludeEnd: boolean = true,
) {
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
        : currentDate.toISOString().split('T')[0], // YYYY-MM-DD
    )

    currentDate.setDate(currentDate.getDate() + 1)
  }

  if (isIncludeEnd) {
    years.add(end.getFullYear())
    months.add(end.getMonth() + 1)
    weeks.add(end.getDay())
    dates.push(end.toISOString().split('T')[0])
  }

  return {
    years: Array.from(years, String),
    months: Array.from(months, String),
    weeks: Array.from(weeks, String),
    dates,
  }
}
