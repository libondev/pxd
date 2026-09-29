import dayjs from 'dayjs/esm/index.js'
import dayjsDurationPlugin from 'dayjs/esm/plugin/duration/index.js'
import { dayjsMillisecondTokenPlugin } from '../plugins/dayjs-millisecond-token.js'

export { dayjs, dayjsDurationPlugin, dayjsMillisecondTokenPlugin }

interface Result<T> {
  years: number[]
  months: number[]
  weeks: number[]
  dates: T[]
}

// Get all dates between the two given dates.
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

  // Validate the dates.
  if (!start.isValid() || !end.isValid()) {
    throw new TypeError('Invalid date input')
  }

  // Make sure the start date is not later than the end date.
  const startDateNormalized = start.isAfter(end) ? end : start
  const endDateNormalized = start.isAfter(end) ? start : end

  // Use dayjs to compute the date difference (in days).
  const startOfStart = startDateNormalized.startOf('day')
  const startOfEnd = endDateNormalized.startOf('day')
  const daysDiff = startOfEnd.diff(startOfStart, 'day')

  // Use dayjs to generate the array of all dates.
  const dates = Array.from({ length: daysDiff + 1 }, (_, index) => {
    return startOfStart.add(index, 'day')
  })

  // Use dayjs to extract the years, months and weekdays.
  const yearsSet = new Set<number>()
  const monthsSet = new Set<number>()
  const weeksSet = new Set<number>()

  dates.forEach((date) => {
    yearsSet.add(date.year())
    monthsSet.add(date.month() + 1)
    weeksSet.add(date.day())
  })

  // Format the date array.
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
