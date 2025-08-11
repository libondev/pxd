import CheckIcon from '@gdsicon/vue/check'
import CopyIcon from '@gdsicon/vue/copy'
import { computed, markRaw, ref } from 'vue'

export function useCopyClick() {
  let copiedTimer: ReturnType<typeof setTimeout>
  let copyPromise: Promise<void> | null = null

  const isCopied = ref(false)

  const render = computed(() => {
    return markRaw(isCopied.value ? CheckIcon : CopyIcon)
  })

  async function copyText(text: string | undefined) {
    if (copyPromise) {
      return copyPromise
    }

    if (typeof navigator.clipboard !== 'undefined') {
      await navigator.clipboard.writeText(text || '')
    } else {
      hackCopy(text || '')
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
    renderAs: render,
    copyText,
  }
}

function hackCopy(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
