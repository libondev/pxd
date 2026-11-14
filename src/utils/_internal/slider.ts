import { clampValue } from '../format.js'

interface RectLike {
  left: number
  width: number
}

export function getPercentage(value: number, min: number, max: number): number {
  return clampValue(((value - min) / (max - min)) * 100, 0, 100)
}

export function getRelativePosition(clientX: number, rect: RectLike): number {
  return clampValue((clientX - rect.left) / rect.width, 0, 1)
}

export function getLabelShift(percentage: number, labelWidth: number, trackWidth: number): number {
  if (!trackWidth || labelWidth > trackWidth) {
    return 0
  }

  const center = (percentage / 100) * trackWidth
  const half = labelWidth / 2

  return clampValue(center, half, trackWidth - half) - center
}
