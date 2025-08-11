import dayjs from 'dayjs/esm/index.js'

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
  let start = dayjs(startDate)
  let end = dayjs(endDate)

  // 验证日期
  if (!start.isValid() || !end.isValid()) {
    throw new TypeError('无效的日期输入')
  }

  // 如果开始日期大于结束日期，则交换它们
  if (start.isAfter(end)) {
    [start, end] = [end, start]
  }

  const years = new Set<number>()
  const months = new Set<number>()
  const weeks = new Set<number>()
  const dates = []

  let currentDate = start.startOf('day')
  const endDateTime = end.startOf('day')

  // 循环直到到达结束日期
  while (!currentDate.isAfter(endDateTime)) {
    years.add(currentDate.year())
    months.add(currentDate.month() + 1)
    weeks.add(currentDate.day())

    dates.push(
      format === 'object'
        ? currentDate.toDate()
        : currentDate.format('YYYY-MM-DD'),
    )

    currentDate = currentDate.add(1, 'day')
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
  const firstDay = dayjs().year(year).month(month - 1).date(1)
  const lastDay = firstDay.endOf('month')

  return {
    days: lastDay.date(),
    firstDay: firstDay.day(),
    lastDay: lastDay.day(),
  }
}
