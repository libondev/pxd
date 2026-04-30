export interface ScalableTextProps {
  /**
   * Text content to measure. Required for width calculation.
   */
  text: string
  /**
   * Minimum font size in pixels. When the text still overflows at this size,
   * it will be allowed to wrap naturally.
   * @default 12
   */
  minFontSize?: number
}
