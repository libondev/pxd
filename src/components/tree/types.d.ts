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
  /** Partially checked parents of the new selection, empty without the cascade. */
  halfCheckedValues: ComponentValue[]
}

export interface TreeHighlightPart {
  text: string
  matched: boolean
}

export type TreeDropPosition = 'before' | 'inside' | 'after'

export interface TreeDropTarget {
  targetValue: ComponentValue
  position: TreeDropPosition
}

export interface TreeMoveLocation {
  /** The parent the node sat in, `undefined` at the root level. */
  parentValue?: ComponentValue
  /** Position inside that parent's children. */
  index: number
}

export interface TreeDropInfo {
  dragValue: ComponentValue
  dragNode: TreeOption
  /** The row the drop is aimed at. */
  targetValue: ComponentValue
  targetNode: TreeOption
  position: TreeDropPosition
}

/**
 * Decides whether a drop may land. Supplying it takes over the policy rules; the structural
 * ones (a node never lands on itself or inside its own subtree) hold either way.
 */
export type TreeAllowDropFn = (info: TreeDropInfo) => boolean

export interface TreeMoveDetail {
  value: ComponentValue
  node: TreeOption
  from: TreeMoveLocation
  to: TreeMoveLocation & {
    /** The row the drop was aimed at. */
    targetValue: ComponentValue
    position: TreeDropPosition
  }
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
  checkStrictly?: boolean
  disabled?: boolean
  expandOnClick?: boolean
  draggable?: boolean
  allowDrop?: TreeAllowDropFn
  showIcon?: boolean
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
  /** Render only the nodes the filter matched, instead of the hits plus their ancestors. */
  searchMatchesOnly?: boolean
  highlightMatch?: boolean
  searchPlaceholder?: string
  itemClass?: ComponentClass
}

export interface TreeEmits {
  'update:modelValue': [TreeModelValue]
  'update:data': [TreeOptions]
  move: [TreeMoveDetail]
  change: [TreeChangeDetail]
  'update:expandedKeys': [ComponentValue[]]
  expand: [TreeNodeDetail]
  collapse: [TreeNodeDetail]
  'update:searchValue': [string]
}
