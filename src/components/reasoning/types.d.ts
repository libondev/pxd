import type { ComponentLabel } from '../../types/shared/props'

export type ReasoningVariant = 'default' | 'simple'

export interface ReasoningProps {
  variant?: ReasoningVariant
  streaming?: boolean
  /** Expanded state, applied whenever the value changes. */
  expand?: boolean
  /** Title text; falls back to `locale.reasoning.thinking` / `thought`. */
  title?: ComponentLabel
}
