<script lang="ts" setup>
import type {
  ActiveGraphCellData,
  ActiveGraphEmits,
  ActiveGraphProps,
  ActiveGraphRowData,
  ActiveGraphTooltipInfo,
} from './types'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { useDelayChange } from '../../composables/use-delay-change'
import { useConfigProvider } from '../../contexts/config-provider'
import { getAllDatesBetween } from '../../utils/date'
import { getCssUnitValue } from '../../utils/format'
import { getColorByThreshold } from '../../utils/get'

defineOptions({
  name: 'PActiveGraph',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ActiveGraphProps>(), {
  legend: true,
  tooltip: true,
  data: () => [],
})

const emits = defineEmits<ActiveGraphEmits>()

const configProvider = useConfigProvider()

const CELL_GAP = 3
const CELL_SIZE = 12

const selectedDate = shallowRef(props.defaultSelect)

const getDefaultStartDate = () => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 1)

  while (date.getDay() !== 0) {
    date.setDate(date.getDate() - 1)
  }

  return date
}

const getDefaultEndDate = () => {
  return new Date()
}

const computedColors = computed(() => {
  if (props.colors) {
    return props.colors
  }

  return {
    0: '',
    5: 'var(--color-green-300)',
    10: 'var(--color-green-500)',
    15: 'var(--color-green-700)',
    20: 'var(--color-green-900)',
  }
})

const rangedDates = computed(() =>
  getAllDatesBetween(
    props.startDate || getDefaultStartDate(),
    props.endDate || getDefaultEndDate(),
  ),
)

const dateCountMap = computed(() => {
  const { date, count } = props.fieldNames || { date: 'date', count: 'count' }

  return props.data.reduce(
    (acc, cur) => {
      acc[cur[date]] = (acc[cur[date]] || 0) + cur[count]
      return acc
    },
    {} as Record<string, number>,
  )
})

// get localized day of week
function getLocalizedDay(dayIndex: number) {
  return configProvider.locale.date.day[dayIndex]
}

const tableHeadList = computed(() => {
  // transpose mode: table head is day of week
  if (props.transpose) {
    return Array.from({ length: 7 }, (_, i) => {
      return [1, 3, 5].includes(i) ? getLocalizedDay(i) : ''
    })
  }

  // non-transpose mode: table head is month
  return createMonthHeaders()
})

// check if should mark as month header
function shouldMarkAsMonthHeader(
  currentMonth: number,
  newMonth: number,
  dayOfMonth: number,
): boolean {
  return currentMonth !== newMonth && dayOfMonth === 1
}

function createMonthHeaders() {
  const dates = rangedDates.value.dates
  const columnsCount = Math.ceil(dates.length / 7)
  const monthHeaders = Array.from({ length: columnsCount }, () => '')

  const firstDate = new Date(dates[0]!)
  let trackedMonth = firstDate.getMonth()

  for (let col = 0; col < columnsCount; col++) {
    for (let dayInWeek = 0; dayInWeek < 7; dayInWeek++) {
      const dateIndex = col * 7 + dayInWeek

      if (dateIndex < dates.length) {
        const currentDate = new Date(dates[dateIndex]!)
        const currentMonth = currentDate.getMonth()
        const dayOfMonth = currentDate.getDate()

        // check if is the first day of the new month
        if (shouldMarkAsMonthHeader(trackedMonth, currentMonth, dayOfMonth)) {
          trackedMonth = currentMonth
          monthHeaders[col] = configProvider.locale.date.month[currentMonth]
        }
      }
    }
  }

  // handle edge case: ensure the first month is correctly displayed and does not overlap with other months
  const isFirstTwoColumnsEmpty = monthHeaders[0] === '' && monthHeaders[1] === ''
  if (isFirstTwoColumnsEmpty) {
    monthHeaders[0] = configProvider.locale.date.month[firstDate.getMonth()]
  }

  return monthHeaders
}

const tableBodyList = computed<ActiveGraphRowData[]>(() => {
  return props.transpose ? createTransposedTableData() : createStandardTableData()
})

// create transposed table data (rows are dates, columns are days of week)
function createTransposedTableData(): ActiveGraphRowData[] {
  const dataMap = dateCountMap.value
  const dateList = rangedDates.value.dates
  const dateListLength = dateList.length

  const monthRows: ActiveGraphRowData[] = []
  let currentMonth = -1
  let currentYear = -1
  let currentRow: ActiveGraphCellData[] | null = null

  for (let i = 0; i < dateListLength; i++) {
    const dateStr = dateList[i]!
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = date.getMonth()
    const dayOfWeek = date.getDay()
    const count = dataMap[dateStr] || 0

    // create new row
    if (currentRow === null) {
      currentRow = []

      // only the first row needs to fill empty cells
      if (i === 0) {
        for (let j = 0; j < dayOfWeek; j++) {
          currentRow.push({
            hidden: true,
            date: undefined,
            count: 0,
            color: undefined,
          })
        }
      }
    }

    // add current date cell
    currentRow.push({
      hidden: false,
      date: dateStr,
      count,
      color: getColorByThreshold(count, computedColors.value),
    })

    // record month change
    if (month !== currentMonth || year !== currentYear) {
      currentMonth = month
      currentYear = year
    }

    const isLastItem = i === dateListLength - 1
    const isRowFull = currentRow.length >= 7

    // row is full or last item, add to result
    if (isRowFull || isLastItem) {
      // fill the last row
      if (currentRow.length < 7 && isLastItem) {
        while (currentRow.length < 7) {
          currentRow.push({
            hidden: true,
            date: undefined,
            count: 0,
            color: undefined,
          })
        }
      }

      monthRows.push([...currentRow] as ActiveGraphRowData)
      currentRow = null
    }
  }

  return markMonthRows(monthRows)
}

// create standard table data (rows are days of week, columns are dates)
function createStandardTableData(): ActiveGraphRowData[] {
  const dataMap = dateCountMap.value
  const dateList = rangedDates.value.dates
  const dateListLength = dateList.length
  const firstDayOfWeek = rangedDates.value.weeks[0]!

  // initialize 7 rows (represents days of week)
  const result: ActiveGraphRowData[] = Array.from({ length: 7 }, (_, i) => {
    const row: ActiveGraphCellData[] = []

    // fill empty cells if the first week is not complete
    if (i < firstDayOfWeek) {
      row.push({
        hidden: true,
        date: undefined,
        count: 0,
        color: undefined,
      })
    }

    // add headerText attribute
    const rowWithHeader = row as ActiveGraphRowData
    rowWithHeader.headerText = [1, 3, 5].includes(i) ? getLocalizedDay(i) : ' '

    return rowWithHeader
  })

  // fill all date data
  for (let i = 0; i < dateListLength; i++) {
    const dateStr = dateList[i]!
    const count = dataMap[dateStr] || 0
    const dayOfWeek = new Date(dateStr).getDay()

    result[dayOfWeek]!.push({
      hidden: false,
      date: dateStr,
      count,
      color: getColorByThreshold(count, computedColors.value),
    })
  }

  return result
}

// mark month rows
function markMonthRows(rows: ActiveGraphRowData[]): ActiveGraphRowData[] {
  const monthMap = {} as Record<string, boolean>

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!
    const firstValidCell = row.find((cell) => !cell.hidden && cell.date)

    if (firstValidCell) {
      const date = new Date(firstValidCell.date!)
      const month = date.getMonth()
      const year = date.getFullYear()
      const day = date.getDate()
      const key = `${year}-${month}`

      // mark month first row
      if (!monthMap[key] || day === 1) {
        monthMap[key] = true
        row.isMonthFirstRow = true
        row.monthName = configProvider.locale.date.month[month]
        row.headerText = row.monthName!
      }
    }
  }

  return rows
}

function onCellClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  const date = target.dataset.date

  if (!date) {
    return
  }

  selectedDate.value = selectedDate.value === date ? '' : date

  emits('select', date, event)
}

let tbodyRect: DOMRect
const tbodyRef = shallowRef<HTMLTableSectionElement>()
const tooltipInfo = shallowRef<ActiveGraphTooltipInfo>({} as ActiveGraphTooltipInfo)

const { value: showTooltip, setValue: setShowTooltip } = useDelayChange(false, { delay: 500 })

// when pointer leaves the table area, hide the tooltip
function onPointerLeave() {
  setShowTooltip(false, true)
  tooltipInfo.value = {} as ActiveGraphTooltipInfo
  tbodyRect = null!
}

// when pointer hovers over a cell, show the tooltip
async function onPointerOver(ev: MouseEvent) {
  if (!props.tooltip) {
    return
  }

  const targetEl = ev.target as HTMLTableCellElement

  if (targetEl.tagName !== 'TD') {
    setShowTooltip(false)
    return
  }

  const date = targetEl.dataset.date

  // if there is no date data, hide the tooltip
  if (!date) {
    setShowTooltip(false, true)
    return
  }

  // on mobile, the pointerover event is triggered before the pointerenter event,
  // and the position information may change after scrolling
  // so getting it before using it can ensure the correct position information
  if (!tbodyRect) {
    tbodyRect = tbodyRef.value!.getBoundingClientRect()
  }

  setShowTooltip(true, true)
  const rect = targetEl.getBoundingClientRect()
  let top = rect.top - tbodyRect.top - CELL_SIZE

  // if only the graph is displayed, the tooltip position needs to be reduced by one cell height, because the title is hidden and the position will be above
  if (props.graphOnly) {
    top -= CELL_SIZE
  }

  tooltipInfo.value = {
    date,
    count: dateCountMap.value[date] || 0,
    left: rect.left - tbodyRect.left + CELL_GAP,
    top,
  }
}

onBeforeUnmount(() => {
  onPointerLeave()
})
</script>

<template>
  <div
    class="pxd-active-graph relative"
    :class="[graphOnly ? 'py-0.75 pr-0.75' : 'pr-5']"
    v-bind="$attrs"
  >
    <table
      role="grid"
      aria-readonly="true"
      class="table-auto border-separate"
      style="border-spacing: 3px"
      @pointerleave="onPointerLeave"
    >
      <thead v-if="!graphOnly" class="text-xs">
        <tr class="h-3">
          <th class="pxd-active-graph--label" style="width: 30px; min-width: 30px" />

          <th
            v-for="(col, i) in tableHeadList"
            :key="col + i"
            class="font-normal relative text-foreground-secondary"
          >
            <span class="-top-1 left-0 absolute whitespace-nowrap">{{ col }}</span>
          </th>
        </tr>
      </thead>

      <tbody
        ref="tbodyRef"
        class="text-xs"
        :style="{ '--active-graph-item-radius': getCssUnitValue(itemRadius) }"
        @click="onCellClick"
        @pointerover.capture="onPointerOver"
      >
        <tr v-for="(row, i) of tableBodyList" :key="i" class="h-3">
          <td
            class="pxd-active-graph--label relative overflow-hidden leading-none text-foreground-secondary"
          >
            <span class="top-0 right-1 absolute">
              {{ row.headerText }}
            </span>
          </td>

          <td
            v-for="col of row"
            :key="col.date"
            class="pxd-active-graph--item w-3 min-w-3 rounded-(--active-graph-item-radius) border border-transparent bg-gray-alpha-100 hover:border-primary motion-safe:transition-appearance"
            :data-date="col.date"
            :class="{
              'pointer-events-none invisible': col.hidden,
              'opacity-30': selectedDate && col.date !== selectedDate,
              'border-primary!': selectedDate && col.date === selectedDate,
            }"
            :style="`background: ${col.color}`"
          />
        </tr>

        <template v-if="legend">
          <tr class="pxd-active-graph--placeholder h-0.5 pointer-events-none" />
          <tr class="pxd-active-graph--legend pointer-events-none">
            <td class="h-3 relative text-foreground-secondary">
              <span class="right-1 absolute top-1/2 -translate-y-1/2">
                {{ configProvider.locale.compare.less }}
              </span>
            </td>

            <td
              v-for="color in computedColors"
              :key="color"
              class="w-3 h-3 rounded-(--active-graph-item-radius) bg-gray-alpha-100 motion-safe:transition-colors"
              :style="`background-color: ${color}`"
            />

            <td class="h-3 w-3 relative text-foreground-secondary">
              <span class="absolute top-1/2 left-px -translate-y-1/2">
                {{ configProvider.locale.compare.more }}
              </span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <Transition v-if="tooltip" name="pxd-transition--fade" mode="out-in" appear>
      <div
        v-if="showTooltip"
        class="pxd-active-graph--tooltip left-0 top-0 px-2 py-1 pointer-events-none absolute z-1 w-max rounded-sm bg-gray-1000 text-13 text-gray-100 duration-50 will-change-transform motion-safe:transition-transform"
        :style="`transform: translate(${tooltipInfo.left}px, ${tooltipInfo.top}px);`"
      >
        <slot name="tooltip" :data="tooltipInfo"
          >{{ tooltipInfo.count }} - {{ tooltipInfo.date }}</slot
        >
      </div>
    </Transition>
  </div>
</template>
