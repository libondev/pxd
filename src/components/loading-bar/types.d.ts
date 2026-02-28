export type LoadingBarStatus = 'running' | 'error' | 'finish'

export interface LoadingBarProps {
  to?: string | object
  group?: string
  minimum?: number
  trickle?: boolean
  hideDelay?: number
  trickleThreshold?: number
}
