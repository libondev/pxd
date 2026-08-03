import type { Component } from 'vue'

export type TimelineItemPlacement = 'top' | 'bottom'
export type TimelineItemType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | ''
export type TimelineItemSize = 'normal' | 'large'

export interface TimelineItemProps {
  timestamp?: string
  hideTimestamp?: boolean
  center?: boolean
  placement?: TimelineItemPlacement
  type?: TimelineItemType
  color?: string
  size?: TimelineItemSize
  icon?: string | Component
  hollow?: boolean
}
