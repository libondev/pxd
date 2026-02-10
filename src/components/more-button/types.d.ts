export interface MoreButtonProps {
  moreText?: string
  lessText?: string
  modelValue?: boolean
}

export interface MoreButtonEmits {
  change: [NonNullable<MoreButtonProps['modelValue']>]
  'update:modelValue': [NonNullable<MoreButtonProps['modelValue']>]
}
