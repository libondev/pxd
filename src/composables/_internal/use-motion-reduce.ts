import type { Ref } from 'vue'
import { computed, shallowRef, triggerRef } from 'vue'
import { isServer } from '../../utils/is.js'
import { useMediaQuery } from '../use-media-query.js'
import { useMutationObserver } from '../use-mutation-observer.js'

/**
 * Also reports reduced motion when the page opts out through `--duration: 0`
 * on `:root`, which system settings alone would never reflect in JS.
 */
export function useMotionReduced(): Readonly<Ref<boolean>> {
  const systemReduced = useMediaQuery('(prefers-reduced-motion: reduce)')

  const rootStyleVersion = shallowRef(0)

  function invalidateRootStyle() {
    triggerRef(rootStyleVersion)
  }

  if (!isServer()) {
    useMutationObserver(() => document.documentElement, invalidateRootStyle, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    })
  }

  return computed(() => {
    if (isServer()) {
      return false
    }

    void rootStyleVersion.value

    if (systemReduced.value) {
      return true
    }

    const unitValue = getComputedStyle(document.documentElement).getPropertyValue('--duration')

    return Number.parseFloat(unitValue) === 0
  })
}
