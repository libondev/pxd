import type { Nullable } from '../types/shared/utils'
import { onScopeDispose, shallowRef } from 'vue'
import { withResolvers } from '../utils/helper'
import { isServer } from '../utils/is'

export function useCopyClick() {
  let copiedTimer: ReturnType<typeof setTimeout>
  let copyResolvers: ReturnType<typeof withResolvers<void>> | null = null

  const isCopied = shallowRef(false)

  async function copyText(text: Nullable<string> = '') {
    if (isServer() || !text) {
      return
    }

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      copyTextCompat(text)
    }

    if (!copyResolvers) {
      copyResolvers = withResolvers<void>()
      copyResolvers.resolve()
    }

    isCopied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      isCopied.value = false
      copyResolvers = null
    }, 1500)

    return copyResolvers.promise
  }

  onScopeDispose(() => {
    clearTimeout(copiedTimer)
    copyResolvers = null
  })

  return {
    isCopied,
    copyText,
  }
}

function copyTextCompat(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
