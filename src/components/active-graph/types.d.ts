interface FieldNames {
  date: string
  count: string
}

export interface ActiveGraphProps {
  data?: Record<string, any>[]
  legend?: boolean
  colors?: Record<string, string>
  startDate?: string | Date
  endDate?: string | Date
  tooltip?: boolean
  graphOnly?: boolean
  transpose?: boolean
  fieldNames?: FieldNames
  itemRadius?: string | number
  defaultSelect?: string
}

export interface ActiveGraphEmits {
  select: [string, MouseEvent]
}

export interface ActiveGraphCellData {
  hidden?: boolean
  count: number
  color?: string
  date?: string
}

export interface ActiveGraphRowData extends Array<ActiveGraphCellData> {
  isMonthFirstRow?: boolean
  monthName?: string
  headerText: string
}

export interface ActiveGraphTooltipInfo {
  date: string
  count: number
  left: number
  top: number
}
