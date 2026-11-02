export interface BubbleGroupProps {
  data?: readonly any[]
  virtual?: boolean
  dataKey?: string
  itemSize?: number | ((index: number) => number)
  overScan?: number
}
