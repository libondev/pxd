import type { Nullable } from '../types/shared/utils'
import { onScopeDispose, shallowRef } from 'vue'
import { isServer } from '../utils/is.js'

export function useCopyClick() {
  let copiedTimer: ReturnType<typeof setTimeout>

  const isCopied = shallowRef(false)

  async function copyText(text: Nullable<string> = '') {
    if (isServer() || !text) {
      return
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
      } else {
        throw new Error('Clipboard API is not available')
      }
    } catch (error) {
      if (!copyTextCompat(text)) {
        throw error
      }
    }

    isCopied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      isCopied.value = false
    }, 1500)
  }

  onScopeDispose(() => {
    clearTimeout(copiedTimer)
  })

  return {
    isCopied,
    copyText,
  }
}

function copyTextCompat(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.setAttribute('readonly', '')
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  return copied
}
