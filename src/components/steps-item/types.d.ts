import type { StepsStatus } from '../steps/types'

export interface StepsItemProps {
  title?: string
  description?: string
  status?: StepsStatus
  disabled?: boolean
}

export interface StepsItemEmits {}
