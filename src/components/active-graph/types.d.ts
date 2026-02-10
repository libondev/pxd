interface FieldNames {
  date: string
  count: string
}

export interface ActiveGraphProps {
  data?: Record<string, any>[]
  legend?: boolean
  startDate?: string | Date
  endDate?: string | Date
  colors?: Record<string, string>
  graphOnly?: boolean
  transpose?: boolean
  tooltip?: boolean
  fieldNames?: FieldNames
  itemRadius?: string | number
}

export interface ActiveGraphEmits {
  'cell-click': [MouseEvent, string]
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
