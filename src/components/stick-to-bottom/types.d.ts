export interface StickToBottomProps {
  /**
   * Pixel distance from the bottom considered "at bottom".
   * @default 8
   */
  threshold?: number
  /**
   * Whether content updates should auto-scroll while at bottom.
   * @default true
   */
  enabled?: boolean
}

export interface StickToBottomEmits {
  change: [isAtBottom: boolean]
}
