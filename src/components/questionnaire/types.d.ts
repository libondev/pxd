import type { ComponentSize } from '../../types/shared/props'

export type QuestionnaireState = 'choosing' | 'skipped' | 'submitted'

export interface QuestionnaireQuestion {
  header: string
  question: string
  multiSelect: boolean
  allowFreeformInput: boolean
  options: Array<{ label: string; description: string }>
}

export interface QuestionnaireAnswer {
  selected: string[]
  freeText: string | null
  skipped: boolean
}

export interface QuestionnaireAnswers {
  [header: string]: QuestionnaireAnswer
}

export interface QuestionnaireProps {
  data?: QuestionnaireQuestion[]
  /** Padding and font size; falls back to the config provider size. */
  size?: ComponentSize
  expand?: boolean
}

export interface QuestionnaireEmits {
  submit: [QuestionnaireAnswers]
}
