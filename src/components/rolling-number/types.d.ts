export interface RollingNumberProps {
  value?: number | string
  durations?: number
  immediate?: boolean
  thousands?: boolean
}

export interface RollingNumberEmits {
  finish: []
}
