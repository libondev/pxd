export interface TocScrollToOptions {
  /** Scroll animation for the jump. */
  behavior?: ScrollBehavior
}

/**
 * Position and scroll operations for a data-driven outline. Implementations must read reactive
 * state (e.g. a layout version) inside the getters, so `PToc` re-evaluates tracking whenever the
 * scroll position or item measurements change.
 */
export interface TocScrollSource {
  /** Scroll offset that aligns `index` with the top of the viewport, or undefined while unknown. */
  getOffsetForIndex: (index: number) => number | undefined
  /** Current scroll offset of the container, or null while unavailable. */
  getScrollOffset: () => number | null
  /** Furthest scroll offset the container can reach. */
  getMaxScrollOffset: () => number
  /** Scroll `index` to the top of the viewport. */
  scrollToIndex: (index: number, options?: TocScrollToOptions) => void
}
