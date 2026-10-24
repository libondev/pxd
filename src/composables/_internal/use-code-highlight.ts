import { onMounted } from 'vue'

/** Past this length the regex scan and one Range per token cost more than the colors are worth. */
export const MAX_HIGHLIGHT_LENGTH = 20000

type HighlightModule = typeof import('microlighter')

let modulePromise: Promise<HighlightModule | null> | null = null
let pending = false
let flushing = false
let unavailable = false

function isHighlightSupported() {
  return typeof CSS !== 'undefined' && 'highlights' in CSS && 'Highlight' in globalThis
}

function loadModule(): Promise<HighlightModule | null> {
  modulePromise ??= import('microlighter').catch(() => {
    unavailable = true

    return null
  })

  return modulePromise
}

async function flush() {
  if (flushing) {
    return
  }

  flushing = true

  try {
    while (pending) {
      pending = false

      const module = await loadModule()

      if (!module) {
        return
      }

      // `.pxd-code-block--line-code` are the per-line code nodes of PCodeBlock's line mode;
      // they sit inside a row wrapper instead of being a direct `pre > code` child.
      await module.highlightAll({
        selector: 'pre > code, .pxd-code-block--line-code',
      })
    }
  } catch {
    // A failed run has already cleared the registered ranges; retrying on every edit only spams.
    unavailable = true
  } finally {
    flushing = false
  }
}

function scheduleHighlight() {
  if (pending || unavailable || !isHighlightSupported()) {
    return
  }

  pending = true
  queueMicrotask(flush)
}

/**
 * `highlightAll()` clears every range the previous run registered and keeps its highlight sets in
 * module state, so one run per instance would wipe every other block. All blocks share one batched,
 * serialized run over `document`.
 */
export function useCodeHighlight() {
  onMounted(scheduleHighlight)

  return { scheduleHighlight }
}
