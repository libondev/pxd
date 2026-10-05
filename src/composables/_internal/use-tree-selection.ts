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
}

export interface UseTreeSelectionReturn {
  checked: ComputedRef<Set<ComponentValue>>
  indeterminate: ComputedRef<Set<ComponentValue>>
  toggle: (value: ComponentValue) => TreeModelValue
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

  const state = computed<DerivedState>(() => {
    if (!toValue(options.multiple)) {
      return { checked: selected.value, indeterminate: new Set<ComponentValue>() }
    }

    return derive(toValue(options.index).list, selected.value)
  })

  function toggle(value: ComponentValue): TreeModelValue {
    if (!toValue(options.multiple)) {
      return selected.value.has(value) ? null : value
    }

    const { list, byValue } = toValue(options.index)
    const meta = byValue.get(value)

    if (!meta) {
      return toValue(options.modelValue) ?? null
    }

    const next = new Set(selected.value)
    const willCheck = !state.value.checked.has(value)

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

    const result = derive(list, next)

    return list.filter((item) => result.checked.has(item.node.value)).map((item) => item.node.value)
  }

  return {
    checked: computed(() => state.value.checked),
    indeterminate: computed(() => state.value.indeterminate),
    toggle,
  }
}
