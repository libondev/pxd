export type TimelineMode = 'start' | 'alternate' | 'alternate-reverse' | 'end' | 'horizontal'

export interface TimelineProps {
  mode?: TimelineMode
  reverse?: boolean
}
