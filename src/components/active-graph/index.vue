<script lang="ts" setup>
import type {
  ActiveGraphCellData,
  ActiveGraphEmits,
  ActiveGraphProps,
  ActiveGraphRowData,
  ActiveGraphTooltipInfo,
} from './types'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useDelayChange } from '../../composables/use-delay-change.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getAllDatesBetween } from '../../utils/date.js'
import { scheduleByRaf } from '../../utils/event.js'
import { getCssUnitValue } from '../../utils/format.js'
import { isUndefined } from '../../utils/is.js'

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

const itemRadiusStyle = computed(() => {
  return {
    '--active-graph-item-radius': getCssUnitValue(props.itemRadius),
  }
})

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

function isShallowEqualObject(a: object, b: object): boolean {
  const keys = Object.keys(a)

  if (keys.length !== Object.keys(b).length) {
    return false
  }

  return keys.every(
    (key) => (a as Record<string, unknown>)[key] === (b as Record<string, unknown>)[key],
  )
}

let colorsSource: Record<string, string> | undefined
let colorsCache: Record<string, string> | undefined

const computedColors = computed(() => {
  if (props.colors) {
    if (
      !isUndefined(colorsCache) &&
      !isUndefined(colorsSource) &&
      isShallowEqualObject(props.colors, colorsSource)
    ) {
      return colorsCache
    }

    colorsSource = props.colors
    colorsCache = { ...props.colors }
    return colorsCache
  }

  colorsSource = undefined
  colorsCache = undefined

  return {
    0: '',
    5: 'var(--color-green-300)',
    10: 'var(--color-green-500)',
    15: 'var(--color-green-700)',
    20: 'var(--color-green-900)',
  }
})

const colorThresholds = computed(() =>
  Object.keys(computedColors.value)
    .map(Number)
    .sort((a, b) => a - b),
)

function getColor(count: number): string {
  const colors = computedColors.value
  const thresholds = colorThresholds.value
  const length = thresholds.length

  if (length === 0) {
    return ''
  }

  for (let i = 0; i < length; i++) {
    if (count < thresholds[i]!) {
      return colors[thresholds[i - 1]!]!
    }
  }

  return colors[thresholds[length - 1]!]!
}

const rangedDates = computed(() =>
  getAllDatesBetween(
    props.startDate || getDefaultStartDate(),
    props.endDate || getDefaultEndDate(),
  ),
)

interface DateInfo {
  year: number
  month: number
  day: number
  weekday: number
}

const dateInfoList = computed<DateInfo[]>(() =>
  rangedDates.value.dates.map((dateStr) => {
    const date = new Date(dateStr)

    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      weekday: date.getDay(),
    }
  }),
)

let dateCountData: readonly Record<string, any>[] | undefined
let dateCountNames: { date: string; count: string } | undefined
let dateCountMapCache: Record<string, number> | undefined

const dateCountMap = computed(() => {
  const fieldNames = props.fieldNames || { date: 'date', count: 'count' }

  const namesUnchanged =
    fieldNames === dateCountNames ||
    (!isUndefined(dateCountNames) && isShallowEqualObject(fieldNames, dateCountNames))

  if (isUndefined(dateCountMapCache) || props.data !== dateCountData || !namesUnchanged) {
    dateCountData = props.data
    dateCountNames = fieldNames
    dateCountMapCache = props.data.reduce(
      (acc, cur) => {
        acc[cur[fieldNames.date]] = (acc[cur[fieldNames.date]] || 0) + cur[fieldNames.count]
        return acc
      },
      {} as Record<string, number>,
    )
  }

  return dateCountMapCache
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

  const firstInfo = dateInfoList.value[0]!
  let trackedMonth = firstInfo.month

  for (let col = 0; col < columnsCount; col++) {
    for (let dayInWeek = 0; dayInWeek < 7; dayInWeek++) {
      const dateIndex = col * 7 + dayInWeek

      if (dateIndex < dates.length) {
        const currentInfo = dateInfoList.value[dateIndex]!

        // check if is the first day of the new month
        if (shouldMarkAsMonthHeader(trackedMonth, currentInfo.month, currentInfo.day)) {
          trackedMonth = currentInfo.month
          monthHeaders[col] = configProvider.locale.date.month[currentInfo.month]
        }
      }
    }
  }

  // handle edge case: ensure the first month is correctly displayed and does not overlap with other months
  const isFirstTwoColumnsEmpty = monthHeaders[0] === '' && monthHeaders[1] === ''
  if (isFirstTwoColumnsEmpty) {
    monthHeaders[0] = configProvider.locale.date.month[firstInfo.month]
  }

  return monthHeaders
}

const tableBodyList = shallowRef<ActiveGraphRowData[]>([])

function refreshTableBodyList() {
  tableBodyList.value = props.transpose ? createTransposedTableData() : createStandardTableData()
}

// create transposed table data (rows are dates, columns are days of week)
function createTransposedTableData(): ActiveGraphRowData[] {
  const dataMap = dateCountMap.value
  const dateList = rangedDates.value.dates
  const dateListLength = dateList.length

  const monthRows: ActiveGraphRowData[] = []
  let currentRow: ActiveGraphCellData[] | null = null

  for (let i = 0; i < dateListLength; i++) {
    const dateStr = dateList[i]!
    const dateInfo = dateInfoList.value[i]!
    const count = dataMap[dateStr] || 0

    // create new row
    if (currentRow === null) {
      currentRow = []

      // only the first row needs to fill empty cells
      if (i === 0) {
        for (let j = 0; j < dateInfo.weekday; j++) {
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
      color: getColor(count),
    })

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

      const row = [...currentRow] as ActiveGraphRowData
      row.rowKey = currentRow.find((cell) => cell.date)?.date
      monthRows.push(row)
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
    const dayOfWeek = dateInfoList.value[i]!.weekday

    result[dayOfWeek]!.push({
      hidden: false,
      date: dateStr,
      count,
      color: getColor(count),
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

const scheduleRefreshTableBodyList = scheduleByRaf(refreshTableBodyList)

refreshTableBodyList()

watch(
  () => [
    dateCountMap.value,
    rangedDates.value,
    props.transpose,
    computedColors.value,
    configProvider.locale.date.day,
    configProvider.locale.date.month,
  ],
  scheduleRefreshTableBodyList,
  { flush: 'post' },
)

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

const pendingTooltip = {
  target: null as HTMLTableCellElement | null,
  date: '',
}

const scheduleTooltipUpdate = scheduleByRaf(() => {
  const { target, date } = pendingTooltip

  if (!target || !date) {
    return
  }

  // on mobile, the pointerover event is triggered before the pointerenter event,
  // and the position information may change after scrolling
  // so getting it before using it can ensure the correct position information
  if (!tbodyRect) {
    tbodyRect = tbodyRef.value!.getBoundingClientRect()
  }

  setShowTooltip(true, true)
  const rect = target.getBoundingClientRect()
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
})

// when pointer leaves the table area, hide the tooltip
function onPointerLeave() {
  pendingTooltip.target = null
  pendingTooltip.date = ''
  scheduleTooltipUpdate.cancel()
  setShowTooltip(false, true)
  tooltipInfo.value = {} as ActiveGraphTooltipInfo
  tbodyRect = null!
}

// when pointer hovers over a cell, show the tooltip
function onPointerOver(ev: MouseEvent) {
  if (!props.tooltip) {
    return
  }

  const targetEl = ev.target as HTMLTableCellElement

  if (targetEl.tagName !== 'TD') {
    if (showTooltip.value) {
      setShowTooltip(false)
    }
    return
  }

  const date = targetEl.dataset.date

  // if there is no date data, hide the tooltip
  if (!date) {
    setShowTooltip(false, true)
    return
  }

  pendingTooltip.target = targetEl
  pendingTooltip.date = date
  scheduleTooltipUpdate()
}

onBeforeUnmount(() => {
  scheduleRefreshTableBodyList.cancel()
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
      class="table-fixed border-separate"
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
        :style="itemRadiusStyle"
        @click="onCellClick"
        @pointerover.capture="onPointerOver"
      >
        <tr v-for="(row, i) of tableBodyList" :key="row.rowKey || i" class="h-3">
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
            class="pxd-active-graph--item max-w-3 min-w-3 rounded-(--active-graph-item-radius) border border-transparent bg-gray-alpha-100 hover:border-primary motion-safe:transition-colors"
            :data-date="col.date"
            :class="{
              'pointer-events-none invisible': col.hidden,
              'opacity-30': selectedDate && col.date !== selectedDate,
              'border-primary!': selectedDate && col.date === selectedDate,
            }"
            :style="{ background: col.color }"
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
              v-for="(color, colorIndex) in computedColors"
              :key="colorIndex"
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
