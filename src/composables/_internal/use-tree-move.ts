import type {
  TreeDropTarget,
  TreeMoveDetail,
  TreeOption,
  TreeOptions,
} from '../../components/tree/types'
import type { ComponentValue } from '../../types/shared'
import type { TreeIndex } from './use-tree-rows'

/**
 * Walks up from `value` looking for `ancestorValue`. Reached in O(depth) instead of scanning
 * `index.list`, which the hit test runs on every pointer move.
 */
export function isTreeDescendant(
  index: TreeIndex,
  ancestorValue: ComponentValue,
  value: ComponentValue,
): boolean {
  const ancestor = index.byValue.get(ancestorValue)
  let current = index.byValue.get(value)

  while (current && current.parentValue !== undefined) {
    const parent = index.byValue.get(current.parentValue)

    if (!parent) {
      return false
    }

    if (parent === ancestor) {
      return true
    }

    current = parent
  }

  return false
}

interface Removal {
  list: TreeOptions
  node: TreeOption
  parentValue?: ComponentValue
  index: number
}

/**
 * Removes the node and rebuilds only the lists and nodes along its path, so untouched
 * subtrees keep their identity and a reference comparison still recognises them.
 */
function removeNode(
  list: TreeOptions,
  childrenField: string,
  value: ComponentValue,
  parentValue?: ComponentValue,
): Removal | undefined {
  const at = list.findIndex((node) => node.value === value)

  if (at !== -1) {
    return {
      list: [...list.slice(0, at), ...list.slice(at + 1)],
      node: list[at],
      parentValue,
      index: at,
    }
  }

  for (let i = 0; i < list.length; i++) {
    const children = list[i][childrenField]

    if (!Array.isArray(children)) {
      continue
    }

    const result = removeNode(children, childrenField, value, list[i].value)

    if (!result) {
      continue
    }

    const next = [...list]
    next[i] = { ...list[i], [childrenField]: result.list }

    return { ...result, list: next }
  }

  return undefined
}

interface Insertion {
  list: TreeOptions
  parentValue?: ComponentValue
  index: number
}

function insertNode(
  list: TreeOptions,
  childrenField: string,
  target: TreeDropTarget,
  node: TreeOption,
  parentValue?: ComponentValue,
): Insertion | undefined {
  const at = list.findIndex((item) => item.value === target.targetValue)

  if (at !== -1) {
    const next = [...list]

    if (target.position === 'inside') {
      const raw = next[at][childrenField]
      const children = Array.isArray(raw) ? raw : []

      next[at] = { ...next[at], [childrenField]: [...children, node] }

      return { list: next, parentValue: next[at].value, index: children.length }
    }

    const index = target.position === 'after' ? at + 1 : at
    next.splice(index, 0, node)

    return { list: next, parentValue, index }
  }

  for (let i = 0; i < list.length; i++) {
    const children = list[i][childrenField]

    if (!Array.isArray(children)) {
      continue
    }

    const result = insertNode(children, childrenField, target, node, list[i].value)

    if (!result) {
      continue
    }

    const next = [...list]
    next[i] = { ...list[i], [childrenField]: result.list }

    return { ...result, list: next }
  }

  return undefined
}

export interface TreeMoveResult {
  data: TreeOptions
  detail: TreeMoveDetail
}

/**
 * Relocates a node relative to a target row.
 *
 * The node is detached before the target is looked up, which is what rejects the whole
 * family of invalid drops for free: the node itself and its own descendants are no longer
 * in the tree, so the insertion pass simply never finds them.
 */
export function moveTreeNode(
  data: TreeOptions,
  childrenField: string,
  value: ComponentValue,
  target: TreeDropTarget,
): TreeMoveResult | undefined {
  const removal = removeNode(data, childrenField, value)

  if (!removal) {
    return undefined
  }

  const insertion = insertNode(removal.list, childrenField, target, removal.node)

  if (!insertion) {
    return undefined
  }

  if (removal.parentValue === insertion.parentValue && removal.index === insertion.index) {
    return undefined
  }

  return {
    data: insertion.list,
    detail: {
      value,
      node: removal.node,
      from: { parentValue: removal.parentValue, index: removal.index },
      to: {
        parentValue: insertion.parentValue,
        index: insertion.index,
        targetValue: target.targetValue,
        position: target.position,
      },
    },
  }
}
