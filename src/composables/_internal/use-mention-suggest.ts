import type { ListOptions } from '../../components/list/types'
import type { MentionFilterMethod } from '../../components/mention/types'
import type { ComputedRef, Ref, ShallowRef } from 'vue'
import { computed, shallowRef, watch } from 'vue'
import { debounce } from '../../utils/timing.js'
import { filterListOptions } from './use-list-filter.js'
import { isListOptionGroup } from './use-selected-list-item.js'

export interface UseMentionSuggestOptions {
  getOptions: (trigger: string) => ListOptions
  getFilterMethod: () => MentionFilterMethod | undefined
  isDisabled: () => boolean
  visible: Ref<boolean>
  setVisible: (visible: boolean) => void
}

export interface UseMentionSuggestReturn {
  filterKeyword: ShallowRef<string>
  listOptions: ShallowRef<ListOptions>
  isPending: ShallowRef<boolean>
  isEmptyResult: ComputedRef<boolean>
  open: (trigger: string) => void
  close: () => void
  setKeyword: (query: string) => void
}

const ASYNC_FILTER_DEBOUNCE = 200

function isOptionsEmpty(options: ListOptions): boolean {
  if (!options.length) {
    return true
  }

  return options.every((entry) => {
    if (isListOptionGroup(entry)) {
      return entry.options.length === 0
    }

    return false
  })
}

/**
 * Suggestion popover state: keyword, list options, and async filter races.
 */
export function useMentionSuggest({
  getOptions,
  getFilterMethod,
  isDisabled,
  visible,
  setVisible,
}: UseMentionSuggestOptions): UseMentionSuggestReturn {
  const filterKeyword = shallowRef('')
  const activeTrigger = shallowRef('')
  const listOptions = shallowRef<ListOptions>([])
  const isPending = shallowRef(false)

  let filterRequestId = 0

  const isEmptyResult = computed(
    () => !!filterKeyword.value.trim() && !isPending.value && isOptionsEmpty(listOptions.value),
  )

  function cancelPendingFilter() {
    isPending.value = false
    filterRequestId += 1
    runFilterDebounced.cancel()
  }

  async function runFilter(query: string, trigger: string) {
    const requestId = ++filterRequestId
    const trimmed = query.trim()

    if (!trimmed) {
      isPending.value = false
      listOptions.value = getOptions(trigger)
      return
    }

    const filterMethod = getFilterMethod()

    if (!filterMethod) {
      isPending.value = false
      listOptions.value = filterListOptions(getOptions(trigger), trimmed)
      return
    }

    isPending.value = true

    try {
      const result = await filterMethod(trimmed, trigger)
      if (requestId !== filterRequestId) {
        return
      }

      listOptions.value = Array.isArray(result) ? result : []
    } catch {
      if (requestId !== filterRequestId) {
        return
      }

      listOptions.value = []
    } finally {
      if (requestId === filterRequestId) {
        isPending.value = false
      }
    }
  }

  function open(trigger: string) {
    if (isDisabled() || visible.value) {
      return
    }

    activeTrigger.value = trigger
    filterKeyword.value = ''
    listOptions.value = getOptions(trigger)
    setVisible(true)
  }

  function close() {
    if (visible.value) {
      setVisible(false)
    } else {
      cancelPendingFilter()
    }
  }

  const runFilterDebounced = debounce((query: string, trigger: string) => {
    void runFilter(query, trigger)
  }, ASYNC_FILTER_DEBOUNCE)

  function setKeyword(query: string) {
    const trigger = activeTrigger.value
    filterKeyword.value = query

    if (!query.trim() || !getFilterMethod()) {
      runFilterDebounced.cancel()
      void runFilter(query, trigger)
      return
    }

    isPending.value = true
    runFilterDebounced(query, trigger)
  }

  // Any hide path (Esc, outside click, select) must drop in-flight filter results.
  watch(visible, (isVisible) => {
    if (!isVisible) {
      cancelPendingFilter()
    }
  })

  return {
    filterKeyword,
    listOptions,
    isPending,
    isEmptyResult,
    open,
    close,
    setKeyword,
  }
}
