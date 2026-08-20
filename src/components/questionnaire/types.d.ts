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
  /**
   * True if no freeText is selected or used
   */
  skipped: boolean
}

export interface QuestionnaireAnswers {
  [header: string]: QuestionnaireAnswer
}

export interface QuestionnaireProps {
  questions?: QuestionnaireQuestion[]
}

export interface QuestionnaireEmits {
  submit: [QuestionnaireAnswers]
}
