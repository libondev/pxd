import { onMounted } from 'vue'

/** Past this length the regex scan and one Range per token cost more than the colors are worth. */
export const MAX_HIGHLIGHT_LENGTH = 20000

/**
 * A streaming block rewrites its text several times a frame; a scan per change costs more than the
 * colors it adds. One run per window keeps a page full of blocks to a few paints a second.
 */
export const HIGHLIGHT_DELAY = 150

type HighlightModule = typeof import('microlighter')

const IMPORT_RETRY_DELAY = 30_000
const MAX_IMPORT_ATTEMPTS = 3

let modulePromise: Promise<HighlightModule | null> | null = null
let pending = false
let flushing = false
let timer: ReturnType<typeof setTimeout> | undefined
let retryAfter = 0
let importAttempts = 0

function isHighlightSupported() {
  return typeof CSS !== 'undefined' && 'highlights' in CSS && 'Highlight' in globalThis
}

function loadModule(): Promise<HighlightModule | null> {
  if (modulePromise) {
    return modulePromise
  }

  // A transient network failure must not disable highlighting for the rest of the session,
  // but a permanently missing module must not be re-requested forever either: allow a few
  // spaced attempts, then stop importing for the rest of the page lifetime.
  if (importAttempts >= MAX_IMPORT_ATTEMPTS || Date.now() < retryAfter) {
    return Promise.resolve(null)
  }

  importAttempts++

  modulePromise = import('microlighter').catch(() => {
    modulePromise = null
    retryAfter = Date.now() + IMPORT_RETRY_DELAY

    return null
  })

  return modulePromise
}

async function flush() {
  if (flushing || !pending) {
    return
  }

  flushing = true
  pending = false

  try {
    const module = await loadModule()

    if (module) {
      // `.pxd-code-block--line-code` are the per-line code nodes of PCodeBlock's line mode;
      // they sit inside a row wrapper instead of being a direct `pre > code` child.
      await module.highlightAll({
        selector: 'pre > code, .pxd-code-block--line-code',
      })
    }
  } catch {
    // A failed run has already cleared its registered ranges. Keep later edits able to retry
    // instead of disabling highlighting for every block in the session.
  } finally {
    flushing = false

    if (pending) {
      scheduleHighlight()
    }
  }
}

function scheduleHighlight() {
  if (!isHighlightSupported()) {
    return
  }

  pending = true

  if (timer !== undefined || flushing) {
    return
  }

  timer = setTimeout(() => {
    timer = undefined
    void flush()
  }, HIGHLIGHT_DELAY)
}

/**
 * `highlightAll()` clears every range the previous run registered and keeps its highlight sets in
 * module state, so one run per instance would wipe every other block. All blocks share one batched,
 * serialized run over `document`.
 */
export function useCodeHighlight(canHighlight: () => boolean = () => true) {
  const request = () => {
    if (canHighlight()) {
      scheduleHighlight()
    }
  }

  onMounted(request)

  return { scheduleHighlight: request }
}
