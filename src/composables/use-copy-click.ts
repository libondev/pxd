import { shallowRef } from 'vue'
import { isServer } from '../utils/is'

export function useCopyClick() {
  let copiedTimer: ReturnType<typeof setTimeout>
  let copyPromise: Promise<void> | null = null

  const isCopied = shallowRef(false)

  async function copyText(text: string | undefined = '') {
    if (isServer()) {
      return
    }

    if (copyPromise) {
      return copyPromise
    }

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      legacyCopyText(text)
    }

    copyPromise = new Promise<void>((resolve) => {
      isCopied.value = true

      resolve()
      clearTimeout(copiedTimer)

      copiedTimer = setTimeout(() => {
        isCopied.value = false
        copyPromise = null
      }, 1500)
    })

    return copyPromise
  }

  return {
    isCopied,
    copyText,
  }
}

function legacyCopyText(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
