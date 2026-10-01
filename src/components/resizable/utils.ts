export const PERCENT_TOTAL = 100

export function isAutoSize(size?: number | null): boolean {
  return size == null || size <= 0
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Percentages are divided by arbitrary container widths, so they end up with
// long binary fractions (100 / 3, 1 / 7). Rounding at the hundredth keeps the
// rendered basis and the v-model payload free of float noise.
export function roundSize(value: number): number {
  return Math.round(value * 100) / 100
}
