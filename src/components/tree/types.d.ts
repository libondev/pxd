import type { ComponentClass, ComponentLabel, ComponentValue } from '../../types/shared'

export interface TreeOption {
  value: ComponentValue
  label?: ComponentLabel
  disabled?: boolean
  children?: TreeOption[]
  keywords?: string[]
  [key: string]: any
}

export type TreeOptions = TreeOption[]

export type TreeModelValue = ComponentValue | ComponentValue[] | null

export type TreeFilterFn = (node: TreeOption, query: string) => boolean

export interface TreeNodeDetail {
  value: ComponentValue
  node: TreeOption
}

export interface TreeChangeDetail extends TreeNodeDetail {
  checked: boolean
  checkedValues: ComponentValue[]
}

export interface TreeHighlightPart {
  text: string
  matched: boolean
}

export interface TreeFlatNode {
  key: ComponentValue
  node: TreeOption
  depth: number
  index: number
  parentValue?: ComponentValue
  hasChildren: boolean
  expanded: boolean
  checked: boolean
  indeterminate: boolean
  matched: boolean
}

export interface TreeProps {
  data?: TreeOptions
  modelValue?: TreeModelValue
  multiple?: boolean
  disabled?: boolean
  expandOnClick?: boolean
  virtual?: boolean
  itemSize?: number
  overScan?: number
  height?: number | string
  indent?: number
  expandedKeys?: ComponentValue[]
  defaultExpandedKeys?: ComponentValue[]
  childrenField?: string
  filterable?: boolean
  filter?: TreeFilterFn
  highlightMatch?: boolean
  searchPlaceholder?: string
  itemClass?: ComponentClass
}

export interface TreeEmits {
  'update:modelValue': [TreeModelValue]
  change: [TreeChangeDetail]
  'update:expandedKeys': [ComponentValue[]]
  expand: [TreeNodeDetail]
  collapse: [TreeNodeDetail]
  'update:searchValue': [string]
}
