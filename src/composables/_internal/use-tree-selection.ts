import type { TreeModelValue } from '../../components/tree/types'
import type { ComponentValue } from '../../types/shared'
import type { TreeIndex, TreeNodeMeta } from './use-tree-rows'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed } from 'vue'
import { toValue } from '../../utils/helper.js'

export interface UseTreeSelectionOptions {
  index: MaybeRefOrGetter<TreeIndex>
  modelValue: MaybeRefOrGetter<TreeModelValue | undefined>
  multiple: MaybeRefOrGetter<boolean>
  /** Keep every node on its own: no cascade, and no parent lit up by its children. */
  checkStrictly?: MaybeRefOrGetter<boolean | undefined>
}

export interface TreeToggleResult {
  value: TreeModelValue
  /** Parents left partially checked by the new selection, empty without the cascade. */
  halfCheckedValues: ComponentValue[]
}

export interface UseTreeSelectionReturn {
  checked: ComputedRef<Set<ComponentValue>>
  indeterminate: ComputedRef<Set<ComponentValue>>
  toggle: (value: ComponentValue) => TreeToggleResult
}

interface DerivedState {
  checked: Set<ComponentValue>
  indeterminate: Set<ComponentValue>
}

function collect(modelValue: TreeModelValue | undefined): Set<ComponentValue> {
  if (Array.isArray(modelValue)) {
    return new Set(modelValue)
  }

  return modelValue == null ? new Set() : new Set([modelValue])
}

/**
 * Post-order pass over the pre-order node list. A node with selectable descendants
 * counts as checked when every one of them is, which is what makes a parent light up
 * after its children were picked one by one. One pass, so cascades stay O(n).
 */
function derive(list: TreeNodeMeta[], selected: ReadonlySet<ComponentValue>): DerivedState {
  const checked = new Set<ComponentValue>()
  const indeterminate = new Set<ComponentValue>()
  const stats = new Map<TreeNodeMeta, { total: number; hit: number }>()

  for (let i = list.length - 1; i >= 0; i--) {
    const meta = list[i]
    let total = 0
    let hit = 0

    for (const child of meta.children) {
      const childStat = stats.get(child)
      total += childStat?.total ?? 0
      hit += childStat?.hit ?? 0
    }

    const selectable = meta.node.disabled !== true
    const isChecked = total > 0 ? hit === total : selected.has(meta.node.value)

    if (isChecked) {
      checked.add(meta.node.value)
    } else if (hit > 0) {
      indeterminate.add(meta.node.value)
    }

    stats.set(meta, {
      total: total + (selectable ? 1 : 0),
      hit: hit + (isChecked && selectable ? 1 : 0),
    })
  }

  return { checked, indeterminate }
}

export function useTreeSelection(options: UseTreeSelectionOptions): UseTreeSelectionReturn {
  const selected = computed(() => collect(toValue(options.modelValue)))

  /** Without the cascade there is no partial parent either: the model *is* the checked set. */
  const state = computed<DerivedState>(() => {
    if (!toValue(options.multiple) || toValue(options.checkStrictly)) {
      return { checked: selected.value, indeterminate: new Set<ComponentValue>() }
    }

    return derive(toValue(options.index).list, selected.value)
  })

  /** Document order, so the emitted array never depends on the order the user clicked. */
  function toToggleResult(list: TreeNodeMeta[], result: DerivedState): TreeToggleResult {
    return {
      value: list
        .filter((item) => result.checked.has(item.node.value))
        .map((item) => item.node.value),
      halfCheckedValues: list
        .filter((item) => result.indeterminate.has(item.node.value))
        .map((item) => item.node.value),
    }
  }

  function toggle(value: ComponentValue): TreeToggleResult {
    if (!toValue(options.multiple)) {
      return { value: selected.value.has(value) ? null : value, halfCheckedValues: [] }
    }

    const { list, byValue } = toValue(options.index)
    const meta = byValue.get(value)

    if (!meta || (toValue(options.checkStrictly) && meta.node.disabled)) {
      return toToggleResult(list, state.value)
    }

    const next = new Set(selected.value)
    const willCheck = !state.value.checked.has(value)

    if (toValue(options.checkStrictly)) {
      if (willCheck) {
        next.add(value)
      } else {
        next.delete(value)
      }

      return toToggleResult(list, { checked: next, indeterminate: new Set() })
    }

    for (let i = list.indexOf(meta); i < meta.end; i++) {
      const item = list[i]

      if (item.node.disabled) {
        continue
      }

      if (willCheck) {
        next.add(item.node.value)
      } else {
        next.delete(item.node.value)
      }
    }

    return toToggleResult(list, derive(list, next))
  }

  return {
    checked: computed(() => state.value.checked),
    indeterminate: computed(() => state.value.indeterminate),
    toggle,
  }
}
