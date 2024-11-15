export type StandardDirection = 'horizontal' | 'vertical'

export type StandardSize = 'small' | 'default' | 'large'

export interface OptionItem {
  label: string
  value: string
  disabled?: boolean
}

export interface StandardErrorObject {
  message: string
  action?: string
  link?: string
}

export type StandardError = string | StandardErrorObject
