import type { Ref } from 'vue'
import { ref, watchEffect } from 'vue'

interface UseGroupExpandOptions {
  expand: Ref<boolean | undefined>
  onPauseAll: () => void
  onResumeAll: () => void
}

const TRANSITION_LOCK_MS = 250
const LEAVE_DEBOUNCE_MS = 200

export function useGroupExpand({ expand, onPauseAll, onResumeAll }: UseGroupExpandOptions) {
  const groupExpand = ref(expand.value)

  let leaveTimeoutId: ReturnType<typeof setTimeout> | undefined
  let isTransitioning = false

  function onPointerEnter() {
    clearTimeout(leaveTimeoutId)

    if (groupExpand.value || isTransitioning) {
      return
    }

    isTransitioning = true
    groupExpand.value = true
    onPauseAll()

    setTimeout(() => {
      isTransitioning = false
    }, TRANSITION_LOCK_MS)
  }

  function onPointerLeave() {
    clearTimeout(leaveTimeoutId)

    if (isTransitioning) {
      return
    }

    leaveTimeoutId = setTimeout(() => {
      onResumeAll()

      if (expand.value) {
        return
      }

      isTransitioning = true
      groupExpand.value = false

      setTimeout(() => {
        isTransitioning = false
      }, TRANSITION_LOCK_MS)
    }, LEAVE_DEBOUNCE_MS)
  }

  function collapse() {
    groupExpand.value = false
  }

  watchEffect(() => {
    groupExpand.value = expand.value
  })

  return {
    groupExpand,
    collapse,
    onPointerEnter,
    onPointerLeave,
  }
}
