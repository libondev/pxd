import CheckIcon from '@gdsicon/vue/check'
import CopyIcon from '@gdsicon/vue/copy'
import { computed, ref } from 'vue'

export function useCopyClick() {
  let copiedTimer: ReturnType<typeof setTimeout>

  const isCopied = ref(false)

  const render = computed(() => {
    return isCopied.value ? CheckIcon : CopyIcon
  })

  async function onCopyClick(text: string | undefined) {
    clearTimeout(copiedTimer)

    if (typeof navigator.clipboard !== 'undefined') {
      await navigator.clipboard.writeText(text || '')
    } else {
      hackCopy(text || '')
    }

    isCopied.value = true

    copiedTimer = setTimeout(() => {
      isCopied.value = false
    }, 1500)
  }

  return {
    isCopied,
    renderAs: render,
    onCopyClick,
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
