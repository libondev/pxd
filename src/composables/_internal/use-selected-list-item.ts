import type {
  ListOption,
  ListOptionEntry,
  ListOptionGroup,
  ListOptions,
  ListOptionSelected,
} from '../../components/list/types'
import type { MaybeRefOrGetter } from 'vue'
import { computed } from 'vue'
import { toArray } from '../../utils/format.js'
import { toValue } from '../../utils/helper.js'

export function isListOptionGroup(option: ListOptionEntry): option is ListOptionGroup {
  return option.type === 'group'
}

export function resolveOptionByValue(
  options: ListOptionEntry[],
  value: ListOptionSelected['value'],
): ListOption | null {
  for (const entry of options) {
    if (isListOptionGroup(entry)) {
      const matchedOption = resolveOptionByValue(entry.options, value)

      if (matchedOption) {
        return matchedOption
      }
    } else if (entry.value === value) {
      return entry
    }
  }

  return null
}

function resolveSelectedListItems(options: ListOptions, modelValue: unknown): ListOption[] {
  const selectedOptions: ListOption[] = []

  for (const value of toArray(modelValue)) {
    const matchedOption = resolveOptionByValue(options, value)

    if (matchedOption) {
      selectedOptions.push(matchedOption)
    }
  }

  return selectedOptions
}

export function useSelectedListItems(
  options: MaybeRefOrGetter<ListOptions>,
  modelValue: MaybeRefOrGetter<unknown>,
) {
  return computed(() => resolveSelectedListItems(toValue(options) ?? [], toValue(modelValue)))
}

export function useSelectedListItem(
  options: MaybeRefOrGetter<ListOptions>,
  modelValue: MaybeRefOrGetter<unknown>,
) {
  const selectedItems = useSelectedListItems(options, modelValue)

  return computed(() => selectedItems.value[0] ?? null)
}
