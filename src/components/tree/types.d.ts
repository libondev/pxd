import type { ComponentClass, ComponentLabel, ComponentValue } from '../../types/shared/props'

export interface TreeOption {
  value?: ComponentValue
  label?: ComponentLabel
  disabled?: boolean
  children?: TreeOption[]
  isLeaf?: boolean
  keywords?: string[]
  [key: string]: any
}

/** Where a node keeps each of the fields the tree reads. */
export interface TreeFieldNames {
  value?: string
  label?: string
  children?: string
  disabled?: string
  isLeaf?: string
}

export type TreeOptions = TreeOption[]

export type TreeModelValue = ComponentValue | ComponentValue[] | null

export type TreeFilterFn = (node: TreeOption, query: string) => boolean

/** Hands the tree the nodes a query matched, their ancestors included. */
export type TreeRemoteFilterFn = (query: string) => TreeOptions | Promise<TreeOptions>

/** Hands the children of a node to the tree. An empty array settles it as a leaf, never asked again. */
export type TreeLoadResolve = (children: TreeOptions) => void

/** Gives up on a node without children: the arrow stays, and the next expand asks again. */
export type TreeLoadReject = () => void

export interface TreeLoadDetail {
  node: TreeOption
  depth: number
  parent?: TreeOption
}

export type TreeLoadFn = (
  detail: TreeLoadDetail,
  resolve: TreeLoadResolve,
  reject: TreeLoadReject,
) => void

/** Keeps a node out of the model without the rest of `disabled`: it still expands and takes drops. */
export type TreeSelectableFn = (node: TreeOption) => boolean

export interface TreeNodeDetail {
  value: ComponentValue
  node: TreeOption
}

export interface TreeChangeDetail extends TreeNodeDetail {
  checked: boolean
  checkedValues: ComponentValue[]
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
  parentValue?: ComponentValue
  index: number
}

export interface TreeDropInfo {
  dragValue: ComponentValue
  dragNode: TreeOption
  targetValue: ComponentValue
  targetNode: TreeOption
  position: TreeDropPosition
}

/** Decides whether a drop may land; the structural rules hold either way. */
export type TreeAllowDropFn = (info: TreeDropInfo) => boolean

export interface TreeMoveDetail {
  value: ComponentValue
  node: TreeOption
  from: TreeMoveLocation
  to: TreeMoveLocation & {
    targetValue: ComponentValue
    position: TreeDropPosition
  }
}

export interface TreeProps {
  data?: TreeOptions
  modelValue?: TreeModelValue
  multiple?: boolean
  checkStrictly?: boolean
  /** Hides the switcher column, its leaf spacer included: expansion stays on the keyboard and `expandKey`. */
  showSwitcher?: boolean
  /** Hides the built-in checkbox: a row click still checks. */
  showCheckbox?: boolean
  disabled?: boolean
  selectable?: TreeSelectableFn
  expandOnly?: boolean
  draggable?: boolean
  allowDrop?: TreeAllowDropFn
  dropInsideLeaf?: boolean
  virtual?: boolean
  itemSize?: number
  overScan?: number
  height?: number | string
  indent?: number
  expandedKeys?: ComponentValue[]
  defaultExpandedKeys?: ComponentValue[]
  accordion?: boolean
  fieldNames?: TreeFieldNames
  /** Fetch the children of a node when it first opens, instead of reading them from `data`. */
  lazy?: boolean
  /** Fetches the children of a node neither `data` nor an earlier request provided. */
  load?: TreeLoadFn
  loading?: boolean
  filterable?: boolean
  filter?: TreeFilterFn
  /** Fetches the nodes a query matched, their ancestors included: giving it searches remotely. */
  remoteFilter?: TreeRemoteFilterFn
  /** Render only the nodes the filter matched, instead of the hits plus their ancestors. */
  searchMatchesOnly?: boolean
  /** Highlights the query inside a label. Only a contiguous run of characters is marked: a
   *  fuzzy hit that is not one still shows its row, just without the highlight. */
  highlightMatch?: boolean
  searchPlaceholder?: string
  searchValue?: string
  defaultSearchValue?: string
  itemClass?: ComponentClass
}

export interface TreeEmits {
  'update:model-value': [TreeModelValue]
  'update:data': [TreeOptions]
  move: [TreeMoveDetail]
  change: [TreeChangeDetail]
  'update:expandedKeys': [ComponentValue[]]
  expand: [TreeNodeDetail]
  collapse: [TreeNodeDetail]
  'node-click': [TreeNodeDetail, MouseEvent]
  'node-contextmenu': [TreeNodeDetail, MouseEvent]
  'update:searchValue': [string]
}
