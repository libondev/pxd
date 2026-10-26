export interface MoreButtonProps {
  moreText?: ComponentText
  lessText?: ComponentText
  modelValue?: boolean
}

export interface MoreButtonEmits {
  change: [NonNullable<MoreButtonProps['modelValue']>]
  'update:model-value': [NonNullable<MoreButtonProps['modelValue']>]
}
