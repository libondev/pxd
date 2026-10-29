export interface RollingNumberProps {
  mode?: 'tween' | 'scroll'
  value?: number | string
  duration?: number
  thousands?: boolean
  animateOnMount?: boolean
}

export interface RollingNumberEmits {
  finish: []
}
