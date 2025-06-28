export interface MenuListOption {
  type?: 'error'
  label?: ComponentLabel
  value?: string | number
  disabled?: boolean
  onClick?: (option: MenuListOption) => void
}
