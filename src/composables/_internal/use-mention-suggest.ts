import type { ListOptionEntry, ListOptions } from '../../components/list/types'
import type { MentionFilterMethod } from '../../components/mention/types'
import type { ComputedRef, Ref, ShallowRef } from 'vue'
import { computed, shallowRef, watch } from 'vue'
import { isFuzzyMatch } from '../../utils/fuzzy-match.js'

export interface UseMentionSuggestOptions {
  getOptions: () => ListOptions
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
  open: () => void
  close: () => void
  setKeyword: (query: string) => void
}

function isListOptionGroup(
  option: ListOptionEntry,
): option is Extract<ListOptionEntry, { type: 'group' }> {
  return option.type === 'group'
}

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

function filterStaticOptions(options: ListOptions, query: string): ListOptions {
  const needle = query.trim()

  if (!needle) {
    return options
  }

  const result: ListOptions = []

  for (const entry of options) {
    if (isListOptionGroup(entry)) {
      const matched = entry.options.filter((item) =>
        isFuzzyMatch(String(item.label ?? ''), needle, item.keywords),
      )

      if (matched.length) {
        result.push({ ...entry, options: matched })
      }
    } else if (isFuzzyMatch(String(entry.label ?? ''), needle, entry.keywords)) {
      result.push(entry)
    }
  }

  return result
}

/**
 * Suggestion popover state: keyword, list options, async filter races, and reopen cache.
 */
export function useMentionSuggest({
  getOptions,
  getFilterMethod,
  isDisabled,
  visible,
  setVisible,
}: UseMentionSuggestOptions): UseMentionSuggestReturn {
  const filterKeyword = shallowRef('')
  const listOptions = shallowRef<ListOptions>([])
  const isPending = shallowRef(false)

  let filterRequestId = 0
  let cachedQuery = ''
  let cachedResults: ListOptions | null = null
  let hasOpened = false

  const isEmptyResult = computed(
    () => !!filterKeyword.value.trim() && !isPending.value && isOptionsEmpty(listOptions.value),
  )

  function cancelPendingFilter() {
    isPending.value = false
    filterRequestId += 1
  }

  async function runFilter(query: string) {
    const requestId = ++filterRequestId
    const trimmed = query.trim()

    if (!trimmed) {
      isPending.value = false
      listOptions.value = getOptions()
      return
    }

    const filterMethod = getFilterMethod()

    if (!filterMethod) {
      isPending.value = false
      listOptions.value = filterStaticOptions(getOptions(), trimmed)
      cachedQuery = trimmed
      cachedResults = listOptions.value
      return
    }

    isPending.value = true

    try {
      const result = await filterMethod(trimmed)
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
        cachedQuery = trimmed
        cachedResults = listOptions.value
      }
    }
  }

  function open() {
    if (isDisabled() || visible.value) {
      return
    }

    if (hasOpened && cachedResults) {
      filterKeyword.value = cachedQuery
      listOptions.value = cachedResults
    } else {
      filterKeyword.value = ''
      listOptions.value = getOptions()
    }

    hasOpened = true
    setVisible(true)
  }

  function close() {
    if (visible.value) {
      setVisible(false)
    } else {
      cancelPendingFilter()
    }
  }

  function setKeyword(query: string) {
    filterKeyword.value = query
    void runFilter(query)
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
