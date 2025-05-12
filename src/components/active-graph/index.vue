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
  date: string
  count: number
  color: string
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

      // 向后找到第一个星期一
      while (date.getDay() !== 1) {
        date.setDate(date.getDate() + 1)
      }

      return date
    },
    endDate: () => new Date().toISOString().split('T')[0],
  },
)

const DEFAULT_COLORS = {
  0: 'var(--gray-alpha-200)',
  5: 'var(--color-green-300)',
  10: 'var(--color-green-500)',
  15: 'var(--color-green-700)',
  20: 'var(--color-green-900)',
}

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
  const dates = allDates.value.dates
  const result: FormattedData[][] = []

  // 获取第一天是星期几 (0-6, 0代表星期日)
  const firstDayOfWeek = new Date(dates[0]).getDay()

  // 行模式：每行对应一个星期几，列代表不同的周
  for (let i = 0; i < 7; i++) {
    const row = []

    if (i < firstDayOfWeek) {
      row.push({
        hidden: true,
        date: dates[i],
        count: 0,
        color: (props.colors || DEFAULT_COLORS)[0],
      })
    }

    result.push(row)
  }

  // 填充数据
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i]
    const dayOfWeek = new Date(date).getDay()
    result[dayOfWeek].push({
      hidden: false,
      date,
      count: dataMap[date] || 0,
      color: getStateColor(dataMap[date] || 0, props.colors || DEFAULT_COLORS),
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
</script>

<template>
  <div class="pxd-active-graph">
    <table
      role="grid"
      aria-readonly="true"
      class="pr-3 overflow-hidden"
      style="border-spacing: 3px; border-collapse: separate"
    >
      <thead>
        <tr class="h-3">
          <th style="width: 28px;min-width: 28px;" />

          <th
            v-for="col in tableMonths"
            :key="col"
            class="relative font-normal text-xs"
          >
            <span class="absolute -top-0.5 left-0 whitespace-nowrap">{{ col }}</span>
          </th>
        </tr>
      </thead>

      <tbody class="text-xs">
        <tr v-for="(row, i) of formatData" :key="i" class="h-3">
          <td class="relative leading-none">
            <span class="absolute top-0.5 left-0">{{ i % 2 === 0 ? config.locale.date.day[i] : ' ' }}</span>
          </td>

          <td
            v-for="col of row"
            :key="col.date"
            class="rounded-[3px] w-3 min-w-3"
            :data-date="col.date"
            :style="`opacity: ${col.hidden ? 0 : undefined}; background-color: ${col.color}`"
          />
        </tr>
      </tbody>
    </table>

    <div v-if="props.legend" class="flex items-center gap-1">
      <span class="text-xs text-gray-900">Less</span>
      <div v-for="color in Object.values(props.colors || DEFAULT_COLORS)" :key="color" class="w-3 h-3 rounded-sm" :style="`background-color: ${color}`" />
      <span class="text-xs text-gray-900">More</span>
    </div>
  </div>
</template>
