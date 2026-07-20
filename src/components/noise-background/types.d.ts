import type { ComponentAs } from '../../types/shared'
import type { CSSProperties } from 'vue'

export interface NoiseBackgroundProps {
  as?: ComponentAs
  blendMode?: CSSProperties['mixBlendMode']
  color?: string
  opacity?: number
}
