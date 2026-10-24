export interface MoreButtonProps {
  moreText?: ComponentLabel
  lessText?: ComponentLabel
  modelValue?: boolean
}

export interface MoreButtonEmits {
  change: [NonNullable<MoreButtonProps['modelValue']>]
  'update:model-value': [NonNullable<MoreButtonProps['modelValue']>]
}
