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

    await navigator.clipboard.writeText(text || '')

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
