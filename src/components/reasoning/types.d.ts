import type { ComponentLabel } from '../../types/shared/props'

export type ReasoningVariant = 'default' | 'simple'

export interface ReasoningProps {
  variant?: ReasoningVariant
  streaming?: boolean
  /** Title text; falls back to `locale.reasoning.thinking` / `thought`. */
  title?: ComponentLabel
}
