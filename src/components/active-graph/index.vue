<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'
import { useDelayChange } from '../../composables/useDelayChange'
import { getColorByThreshold } from '../../utils/colors'
import { getAllDatesBetween } from '../../utils/dates'

interface DataItem {
  date: string
  count: number
}

interface Props {
  data?: DataItem[]
  legend?: boolean
  startDate?: string | Date
  endDate?: string | Date
  colors?: Record<string, string>
  graphOnly?: boolean
  transpose?: boolean
  tooltipText?: string
}

/** 格式化后的单元格数据 */
interface CellData {
  hidden: boolean
  date: string | undefined
  count: number
  color: string | undefined
}

/** 行数据（包含月份信息） */
interface RowData extends Array<CellData> {
  isMonthFirstRow?: boolean
  monthName?: string
  headerText: string
}

/** 提示框信息 */
interface TooltipInfo {
  date: string
  count: number
  left: number
  top: number
}

defineOptions({
  name: 'PActiveGraph',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    legend: true,
    graphOnly: false,
    tooltipText: '{COUNT} on {DATE}',
    data: () => [],
    startDate: () => {
      // 默认起始日期为一年前的第一个周日
      const date = new Date()
      date.setFullYear(date.getFullYear() - 1)

      // 向前找到第一个星期日
      while (date.getDay() !== 0) {
        date.setDate(date.getDate() - 1)
      }

      return date
    },
    endDate: () => new Date(),
    colors: () => ({
      0: '',
      5: 'var(--color-green-300)',
      10: 'var(--color-green-500)',
      15: 'var(--color-green-700)',
      20: 'var(--color-green-900)',
    }),
  },
)

const emits = defineEmits<{
  'cell-click': [MouseEvent, string]
}>()

const config = useConfigProvider()

const CELL_GAP = 3
const CELL_SIZE = 12

const rangedDates = computed(() => getAllDatesBetween(props.startDate, props.endDate))

const dateCountMap = computed(() => {
  return props.data.reduce((acc, cur) => {
    acc[cur.date] = (acc[cur.date] || 0) + cur.count
    return acc
  }, {} as Record<string, number>)
})

/** 根据日期索引获取本地化的星期几 */
function getLocalizedDay(dayIndex: number) {
  return config.locale.date.day[dayIndex]
}

/** 创建表头（月份或星期）数据 */
const tableHeadList = computed(() => {
  // 转置模式：表头为星期几
  if (props.transpose) {
    return Array.from({ length: 7 }, (_, i) => {
      return [1, 3, 5].includes(i) ? getLocalizedDay(i) : ''
    })
  }

  // 非转置模式：表头为月份
  return createMonthHeaders()
})

/** 检查是否需要在此位置显示月份标记 */
function shouldMarkAsMonthHeader(
  currentMonth: number,
  newMonth: number,
  dayOfMonth: number,
): boolean {
  return currentMonth !== newMonth && dayOfMonth === 1
}

/**
 * 获取月份表头标记位置和名称
 */
function createMonthHeaders() {
  const dates = rangedDates.value.dates
  const columnsCount = Math.ceil(dates.length / 7)
  const monthHeaders = Array.from({ length: columnsCount }, () => '')

  const firstDate = new Date(dates[0])
  let trackedMonth = firstDate.getMonth()

  for (let col = 0; col < columnsCount; col++) {
    for (let dayInWeek = 0; dayInWeek < 7; dayInWeek++) {
      const dateIndex = col * 7 + dayInWeek

      if (dateIndex < dates.length) {
        const currentDate = new Date(dates[dateIndex])
        const currentMonth = currentDate.getMonth()
        const dayOfMonth = currentDate.getDate()

        // 检查是否为新月份的第一天
        if (shouldMarkAsMonthHeader(trackedMonth, currentMonth, dayOfMonth)) {
          trackedMonth = currentMonth
          monthHeaders[col] = config.locale.date.month[currentMonth]
        }
      }
    }
  }

  // 处理边缘情况：确保第一个月份正确显示且不会和其他月份重叠
  const isFirstTwoColumnsEmpty = monthHeaders[0] === '' && monthHeaders[1] === ''
  if (isFirstTwoColumnsEmpty) {
    monthHeaders[0] = config.locale.date.month[firstDate.getMonth()]
  }

  return monthHeaders
}

/** 计算表格主体数据 */
const tableBodyList = computed<RowData[]>(() => {
  return props.transpose
    ? createTransposedTableData()
    : createStandardTableData()
})

/** 创建转置模式的表格数据（行为日期，列为星期） */
function createTransposedTableData(): RowData[] {
  const dataMap = dateCountMap.value
  const dateList = rangedDates.value.dates
  const dateListLength = dateList.length

  const monthRows: RowData[] = []
  let currentMonth = -1
  let currentYear = -1
  let currentRow: CellData[] | null = null

  for (let i = 0; i < dateListLength; i++) {
    const dateStr = dateList[i]
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = date.getMonth()
    const dayOfWeek = date.getDay()
    const count = dataMap[dateStr] || 0

    // 创建新行
    if (currentRow === null) {
      currentRow = []

      // 只有第一行需要填充空白单元格
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

    // 添加当前日期单元格
    currentRow.push({
      hidden: false,
      date: dateStr,
      count,
      color: getColorByThreshold(count, props.colors),
    })

    // 记录月份变化
    if (month !== currentMonth || year !== currentYear) {
      currentMonth = month
      currentYear = year
    }

    const isLastItem = i === dateListLength - 1
    const isRowFull = currentRow.length >= 7

    // 行满或是最后一项，添加到结果
    if (isRowFull || isLastItem) {
      // 补齐最后一行
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

      monthRows.push([...currentRow] as RowData)
      currentRow = null
    }
  }

  return markMonthRows(monthRows)
}

/** 创建标准模式的表格数据（行为星期，列为日期） */
function createStandardTableData(): RowData[] {
  const dataMap = dateCountMap.value
  const dateList = rangedDates.value.dates
  const dateListLength = dateList.length
  const firstDayOfWeek = rangedDates.value.weeks[0]

  // 初始化7行（代表星期几）
  const result: RowData[] = Array.from({ length: 7 }, (_, i) => {
    const row: CellData[] = []

    // 第一周不完整时填充空白单元格
    if (i < firstDayOfWeek) {
      row.push({
        hidden: true,
        date: undefined,
        count: 0,
        color: undefined,
      })
    }

    // 添加headerText属性
    const rowWithHeader = row as RowData
    rowWithHeader.headerText = [1, 3, 5].includes(i) ? getLocalizedDay(i) : ' '

    return rowWithHeader
  })

  // 填充所有日期数据
  for (let i = 0; i < dateListLength; i++) {
    const dateStr = dateList[i]
    const count = dataMap[dateStr] || 0
    const dayOfWeek = new Date(dateStr).getDay()

    result[dayOfWeek].push({
      hidden: false,
      date: dateStr,
      count,
      color: getColorByThreshold(count, props.colors),
    })
  }

  return result
}

/** 为行添加月份标记 */
function markMonthRows(rows: RowData[]): RowData[] {
  const monthMap = {} as Record<string, boolean>

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const firstValidCell = row.find(cell => !cell.hidden && cell.date)

    if (firstValidCell) {
      const date = new Date(firstValidCell.date!)
      const month = date.getMonth()
      const year = date.getFullYear()
      const day = date.getDate()
      const key = `${year}-${month}`

      // 标记月份第一行
      if (!monthMap[key] || day === 1) {
        monthMap[key] = true
        row.isMonthFirstRow = true
        row.monthName = config.locale.date.month[month]
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

  emits('cell-click', event, date)
}

let tbodyRect: DOMRect
const tbodyRef = shallowRef<HTMLTableSectionElement>()
const {
  value: showTooltip,
  set: setShowTooltip,
  setImmediate: setShowTooltipImmediate,
} = useDelayChange(false, 500)
const tooltipInfo = shallowRef<TooltipInfo>({} as TooltipInfo)

const formatTooltipText = computed(() => {
  if (props.tooltipText) {
    const { date = '', count = 0 } = tooltipInfo.value

    return props.tooltipText
      .replace(/\{DATE\}/g, date)
      .replace(/\{COUNT\}/g, String(count))
  }

  return ''
})

// 鼠标离开表格区域, 隐藏提示框
function onMouseLeave() {
  setShowTooltipImmediate(false)
  tooltipInfo.value = {} as TooltipInfo
  tbodyRect = null!
}

// 鼠标悬停在单元格上, 显示提示框
async function onMouseOver(ev: MouseEvent) {
  const targetEl = ev.target as HTMLTableCellElement

  if (targetEl.tagName !== 'TD') {
    setShowTooltip(false)
    return
  }

  const date = targetEl.dataset.date

  // 没有日期数据则隐藏提示
  if (!date) {
    setShowTooltipImmediate(false)
    return
  }

  // 移动端 pointerover 事件比 pointerenter 事件先触发，
  // 并且在滚动后位置信息可能会出现变化
  // 所以放在使用前获取就能保证获取到正确的位置信息
  if (!tbodyRect) {
    tbodyRect = tbodyRef.value!.getBoundingClientRect()
  }

  // 立即显示提示
  setShowTooltipImmediate(true)
  const rect = targetEl.getBoundingClientRect()
  let top = rect.top - tbodyRect.top - CELL_SIZE

  // 如果只显示图表, 则提示框位置需要减去一个单元格的高度, 因为标题被隐藏了位置会偏上
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
  onMouseLeave()
})
</script>

<template>
  <div class="pxd-active-graph relative" :class="[graphOnly ? 'py-[3px] pr-[3px]' : 'pr-5']">
    <table
      role="grid"
      aria-readonly="true"
      class="border-separate"
      style="border-spacing: 3px;"
      @pointerleave="onMouseLeave"
    >
      <thead v-if="!graphOnly" class="text-xs">
        <tr class="h-3">
          <th class="pxd-active-graph--label" style="width: 30px;min-width: 30px;" />

          <th
            v-for="(col, i) in tableHeadList"
            :key="col + i"
            class="relative font-normal text-foreground-secondary"
          >
            <span class="absolute -top-1 left-0 whitespace-nowrap">{{ col }}</span>
          </th>
        </tr>
      </thead>

      <tbody
        ref="tbodyRef"
        class="text-xs"
        @click="onCellClick"
        @pointerover.capture="onMouseOver"
      >
        <tr v-for="(row, i) of tableBodyList" :key="i" class="h-3">
          <td class="pxd-active-graph--label relative leading-none text-foreground-secondary overflow-hidden">
            <span class="absolute top-0 right-1">
              {{ row.headerText }}
            </span>
          </td>

          <td
            v-for="col of row"
            :key="col.date"
            class="pxd-active-graph--item rounded-xs w-3 min-w-3 bg-gray-alpha-200 motion-safe:transition-colors"
            :data-date="col.date"
            :class="{ 'pointer-events-none opacity-0': col.hidden }"
            :style="`background: ${col.color}`"
          />
        </tr>

        <template v-if="props.legend">
          <tr class="pxd-active-graph--placeholder pointer-events-none h-0.5" />
          <tr class="pxd-active-graph--legend pointer-events-none">
            <td class="relative h-3 text-foreground-secondary">
              <span class="absolute top-1/2 right-1 -translate-y-1/2">{{ config.locale.compare.less }}</span>
            </td>

            <td
              v-for="color in props.colors"
              :key="color"
              class="w-3 h-3 rounded-xs bg-gray-alpha-200 motion-safe:transition-colors"
              :style="`background-color: ${color}`"
            />

            <td class="relative h-3 text-foreground-secondary w-3">
              <span class="absolute top-1/2 left-px -translate-y-1/2">{{ config.locale.compare.more }}</span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <Transition name="pxd-transition--fade">
      <div
        v-if="showTooltip"
        class="pxd-active-graph--tooltip left-0 top-0 bg-gray-1000 pointer-events-none text-gray-100 absolute z-10 px-2 py-1 text-[13px] rounded-sm w-max duration-50 motion-safe:transition-transform"
        :style="`transform: translate(${tooltipInfo.left}px, ${tooltipInfo.top}px);`"
      >
        <slot name="tooltip" :data="tooltipInfo">
          {{ formatTooltipText }}
        </slot>
      </div>
    </Transition>
  </div>
</template>
