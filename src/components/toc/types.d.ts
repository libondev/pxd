export interface TocItem {
  /** `id` of the heading element this entry scrolls to. */
  id: string
  /** Text rendered for the entry. */
  label: string
  /** Heading level (1-6), drives the indent. */
  level: number
}

export type TocScrollBehavior = 'auto' | 'instant' | 'smooth'

export interface TocProps {
  /** Headings that make up the outline, as a CSS selector. */
  selector: string
  /** Scrollable container holding the headings. Leave empty for the window. */
  scrollTarget?: HTMLElement | null
  /** Pixels kept above the heading when scrolling to it, and the spy probe line. */
  offset?: number
  /** Scroll animation used when an entry is activated. */
  scrollBehavior?: TocScrollBehavior
  /** Scroll the active entry back into view when it leaves the list. */
  scrollActiveIntoView?: boolean
}

export interface TocEmits {
  /** Emitted when the user activates an entry. */
  'item-click': [item: TocItem, event: MouseEvent]
  /** Emitted when the active heading changes. */
  'active-change': [item: TocItem | null]
}
