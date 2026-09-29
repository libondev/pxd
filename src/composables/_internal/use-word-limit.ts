import type { ComponentLabel } from '../../types/shared'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed } from 'vue'
import { isTruthyProp } from '../../utils/format.js'
import { toValue } from '../../utils/helper.js'

interface WordLimitOptions {
  modelValue: MaybeRefOrGetter<ComponentLabel>
  showWordLimit: MaybeRefOrGetter<unknown>
  maxLength: MaybeRefOrGetter<string | number | null | undefined>
  wordLimitPosition: MaybeRefOrGetter<'inside' | 'outside' | undefined>
  isComposing: MaybeRefOrGetter<boolean>
}

export interface WordLimit {
  wordCount: ComputedRef<number>
  isWordLimitShown: ComputedRef<boolean>
  hasMaxLength: ComputedRef<boolean>
  isWordLimitOutside: ComputedRef<boolean>
  nativeMaxLength: ComputedRef<string | number | undefined>
  wordLimitText: ComputedRef<string>
  isWordLimitExceeded: ComputedRef<boolean>
}

/**
 * Shared word-limit state used by PInput and PTextarea.
 * Keeps the two components' word-count/computed logic in sync.
 */
export function useWordLimit(options: WordLimitOptions): WordLimit {
  const wordCount = computed(() => String(toValue(options.modelValue) ?? '').length)
  const isWordLimitShown = computed(() => isTruthyProp(toValue(options.showWordLimit)))
  const hasMaxLength = computed(() => {
    const maxLength = toValue(options.maxLength)
    return maxLength != null && maxLength !== ''
  })
  const isWordLimitOutside = computed(() => toValue(options.wordLimitPosition) === 'outside')
  const nativeMaxLength = computed(() => {
    if (toValue(options.isComposing)) {
      return undefined
    }

    return toValue(options.maxLength) ?? undefined
  })

  const wordLimitText = computed(() => {
    if (hasMaxLength.value) {
      return `${wordCount.value} / ${toValue(options.maxLength)}`
    }

    return `${wordCount.value}`
  })

  const isWordLimitExceeded = computed(
    () => hasMaxLength.value && wordCount.value > Number(toValue(options.maxLength)),
  )

  return {
    wordCount,
    isWordLimitShown,
    hasMaxLength,
    isWordLimitOutside,
    nativeMaxLength,
    wordLimitText,
    isWordLimitExceeded,
  }
}
