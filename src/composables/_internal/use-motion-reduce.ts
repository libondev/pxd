import type { Ref } from 'vue'
import { computed, onScopeDispose, shallowRef } from 'vue'
import { isServer } from '../../utils/is.js'
import { useMediaQuery } from '../use-media-query.js'

interface RootDurationState {
  reduced: Ref<boolean>
  observer: MutationObserver | undefined
  count: number
}

let shared: RootDurationState | undefined

function readRootDurationReduced() {
  const unitValue = getComputedStyle(document.documentElement).getPropertyValue('--duration')

  return Number.parseFloat(unitValue) === 0
}

function createRootDurationState(): RootDurationState {
  const reduced = shallowRef(isServer() ? false : readRootDurationReduced())
  const entry: RootDurationState = { reduced, observer: undefined, count: 0 }

  if (!isServer() && typeof globalThis.MutationObserver !== 'undefined') {
    // Owned by the module, not by a scope: one instance has to outlive its creator.
    const observer = new globalThis.MutationObserver(() => {
      // Assigning through the ref already skips the notify step when the value held, so a
      // `<html>` mutation that never reaches `--duration` costs subscribers nothing.
      reduced.value = readRootDurationReduced()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    })

    entry.observer = observer
  }

  return entry
}

function useRootDurationReduced(): Ref<boolean> {
  const entry = (shared ??= createRootDurationState())

  entry.count++

  onScopeDispose(() => {
    if (--entry.count > 0) {
      return
    }

    entry.observer?.disconnect()
    shared = undefined
  })

  return entry.reduced
}

/**
 * Also reports reduced motion when the page opts out through `--duration: 0`
 * on `:root`, which system settings alone would never reflect in JS.
 */
export function useMotionReduced(): Readonly<Ref<boolean>> {
  const systemReduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const rootReduced = useRootDurationReduced()

  return computed(() => systemReduced.value || rootReduced.value)
}
