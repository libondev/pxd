import type {
  ListOption,
  ListOptionEntry,
  ListOptionGroup,
  ListOptions,
  ListOptionSelected,
} from '../../components/list/types'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed } from 'vue'
import { toValue } from '../../utils/helper.js'
import { isNil } from '../../utils/is.js'

function isListOptionGroup(option: ListOptionEntry): option is ListOptionGroup {
  return option.type === 'group'
}

function resolveOptionByValue(
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
    } else if (entry.children?.length) {
      const matchedOption = resolveOptionByValue(entry.children, value)

      if (matchedOption) {
        return matchedOption
      }
    }
  }

  return null
}

export function useSelectedListItem(options: MaybeRefOrGetter<ListOptions>, modelValue: Ref<any>) {
  const selectedItem = computed<ReturnType<typeof resolveOptionByValue>>(() => {
    if (isNil(toValue(modelValue))) {
      return null
    }

    return resolveOptionByValue(toValue(options ?? []), toValue(modelValue))
  })

  return selectedItem
}
