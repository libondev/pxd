import type { Component } from 'vue'
import type { ComponentSize } from '../../types/shared/props'

export type TimelineItemPlacement = 'top' | 'bottom'
export type TimelineItemType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | ''

export interface TimelineItemProps {
  timestamp?: string
  hideTimestamp?: boolean
  placement?: TimelineItemPlacement
  type?: TimelineItemType
  color?: string
  size?: ComponentSize
  icon?: string | Component
  hollow?: boolean
}
