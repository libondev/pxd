import type { ComponentClass, ComponentLabel, ComponentValue } from '../../types/shared'

export interface TreeOption {
  value: ComponentValue
  label?: ComponentLabel
  disabled?: boolean
  children?: TreeOption[]
  /** Marks a leaf under `lazy`: no arrow, and never handed to `load`. */
  isLeaf?: boolean
  keywords?: string[]
  [key: string]: any
}

export type TreeOptions = TreeOption[]

export type TreeModelValue = ComponentValue | ComponentValue[] | null

export type TreeFilterFn = (node: TreeOption, query: string) => boolean

/** Hands the children of a node to the tree. An empty array marks it a leaf. */
export type TreeLoadResolve = (children: TreeOptions) => void

/** Gives up on a node without children: the arrow stays, and the next expand asks again. */
export type TreeLoadReject = () => void

export interface TreeLoadDetail {
  /** The node whose children are asked for, as the tree holds it. */
  node: TreeOption
  depth: number
  parent?: TreeOption
}

export type TreeLoadFn = (
  detail: TreeLoadDetail,
  resolve: TreeLoadResolve,
  reject: TreeLoadReject,
) => void

/**
 * Decides whether a node takes part in the selection. A refused node stays a full citizen: it
 * expands, drags and takes drops like any other, it only never lands in the model. That is what
 * separates it from `disabled`, and it is how a tree of folders offers only its files, or one that
 * reopens over saved data keeps what was saved out of reach.
 */
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
}

export interface TreeProps {
  data?: TreeOptions
  modelValue?: TreeModelValue
  multiple?: boolean
  checkStrictly?: boolean
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
  childrenField?: string
  /** Fetch the children of a node when it first opens, instead of reading them from `data`. */
  lazy?: boolean
  /** Fetches the children of a node neither `data` nor an earlier request provided. */
  load?: TreeLoadFn
  loading?: boolean
  filterable?: boolean
  filter?: TreeFilterFn
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
  'update:modelValue': [TreeModelValue]
  'update:data': [TreeOptions]
  move: [TreeMoveDetail]
  change: [TreeChangeDetail]
  'update:expandedKeys': [ComponentValue[]]
  expand: [TreeNodeDetail]
  collapse: [TreeNodeDetail]
  'update:searchValue': [string]
}
