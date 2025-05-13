<script setup lang="ts">
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'
import { getStateColor } from '../../utils/colors'
import { getAllDatesBetween } from '../../utils/date'

interface Props {
  data?: any[]
  legend?: boolean
  startDate?: string | Date
  endDate?: string | Date
  colors?: Record<string, string>
}

interface FormattedData {
  hidden: boolean
  date: string | undefined
  count: number
  color: string | undefined
}

defineOptions({
  name: 'PActiveGraph',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    legend: true,
    data: () => [],
    startDate: () => {
      const date = new Date()
      date.setFullYear(date.getFullYear() - 1)

      // 向后找到第一个星期日
      while (date.getDay() !== 0) {
        date.setDate(date.getDate() + 1)
      }

      return date
    },
    endDate: () => new Date().toISOString().split('T')[0],
    colors: () => ({
      0: 'var(--color-gray-alpha-200)',
      5: 'var(--color-green-300)',
      10: 'var(--color-green-500)',
      15: 'var(--color-green-700)',
      20: 'var(--color-green-900)',
    }),
  },
)

const emits = defineEmits<{
  cellClick: [MouseEvent, string]
}>()

const config = useConfigProvider()

const allDates = computed(() => getAllDatesBetween(props.startDate, props.endDate))

const dataCountsMap = computed<Record<string, number>>(() => {
  const map = props.data.reduce((acc, cur) => {
    acc[cur.date] = (acc[cur.date] || 0) + cur.count

    return acc
  }, {})

  return map
})

const formatData = computed(() => {
  const dataMap = dataCountsMap.value
  const dateList = allDates.value.dates
  const dateListLength = dateList.length
  const result: FormattedData[][] = []

  const firstDayOfWeek = new Date(dateList[0]).getDay()

  for (let i = 0; i < 7; i++) {
    const row = []

    if (i < firstDayOfWeek) {
      row.push({
        hidden: true,
        date: undefined,
        count: 0,
        color: undefined,
      })
    }

    result.push(row)
  }

  for (let i = 0; i < dateListLength; i++) {
    const date = dateList[i]
    const dateCount = dataMap[date] || 0
    const dayOfWeek = new Date(date).getDay()

    result[dayOfWeek].push({
      hidden: false,
      date,
      count: dateCount,
      color: getStateColor(dateCount, props.colors),
    })
  }

  return result
})

const tableMonths = computed(() => {
  const dates = allDates.value.dates
  const result: string[] = []

  const colCount = Math.ceil(allDates.value.dates.length / 7)

  // 初始化结果数组
  for (let i = 0; i < colCount; i++) {
    result.push('')
  }

  // 第一列总是显示月份
  const firstDate = new Date(dates[0])
  result[0] = config.locale.date.month[firstDate.getMonth()]

  // 获取第一天是星期几，用于计算后续日期的列索引
  const firstDayOfWeek = firstDate.getDay()

  // 遍历所有日期，查找每个月的第一天
  let currentMonth = firstDate.getMonth()

  for (let i = 1; i < dates.length; i++) {
    const date = new Date(dates[i])
    const month = date.getMonth()
    const day = date.getDate()

    // 如果月份发生变化且是该月第一天
    if (month !== currentMonth && day === 1) {
      // 计算该日期在哪一列
      // (i - firstDayOfWeek) 是修正第一天偏移
      // Math.floor((i - firstDayOfWeek) / 7) + 1 计算出以周为单位的列索引
      const colIndex = Math.floor((i + 7 - firstDayOfWeek) / 7)

      if (colIndex < colCount) {
        result[colIndex] = config.locale.date.month[month]
        currentMonth = month
      }
    }
  }

  return result
})

function onCellClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  const date = target.dataset.date

  if (!date) {
    return
  }

  emits('cellClick', event, date)
}
</script>

<template>
  <div class="pxd-active-graph">
    <table
      role="grid"
      aria-readonly="true"
      class="pr-5 overflow-hidden"
      style="border-spacing: 3px; border-collapse: separate"
    >
      <thead>
        <tr class="h-3">
          <th style="width: 30px;min-width: 30px;" />

          <th
            v-for="col in tableMonths"
            :key="col"
            class="relative font-normal text-xs text-gray-900"
          >
            <span class="absolute -top-1 left-0 whitespace-nowrap">{{ col }}</span>
          </th>
        </tr>
      </thead>

      <tbody class="text-xs" @click="onCellClick">
        <tr v-for="(row, i) of formatData" :key="i" class="h-3">
          <td class="relative leading-none text-gray-900">
            <span class="absolute top-0 right-1">{{ [1, 3, 5].includes(i) ? config.locale.date.day[i] : ' ' }}</span>
          </td>

          <td
            v-for="col of row"
            :key="col.date"
            class="rounded-xs w-3 min-w-3 motion-safe:transition-colors"
            :data-date="col.date"
            :class="{ 'pointer-events-none opacity-0': col.hidden }"
            :style="`background: ${col.color}`"
          />
        </tr>

        <template v-if="props.legend">
          <tr class="h-0.5" />
          <tr class="pxd-active-graph--legend select-none">
            <td class="relative h-3 text-xs text-gray-700">
              <span class="absolute -top-px right-1">{{ config.locale.compare.less }}</span>
            </td>

            <td
              v-for="color in props.colors"
              :key="color" class="w-3 h-3 rounded-xs motion-safe:transition-colors" :style="`background-color: ${color}`"
            />

            <td class="relative h-3 text-xs text-gray-700 w-3">
              <span class="absolute -top-px left-px" style="width: 30px;min-width: 30px;">{{ config.locale.compare.more }}</span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
