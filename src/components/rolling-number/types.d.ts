export interface RollingNumberProps {
  mode?: 'tween' | 'scroll'
  value?: number | string
  durations?: number
  thousands?: boolean
  animateOnMount?: boolean
}

export interface RollingNumberEmits {
  finish: []
}
