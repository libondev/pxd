import type { ComponentSize } from '../../types/shared/props'
import type { Component } from 'vue'

export type TimelineItemPosition = 'top' | 'bottom'
export type TimelineItemVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | ''

export interface TimelineItemProps {
  timestamp?: string
  hideTimestamp?: boolean
  position?: TimelineItemPosition
  variant?: TimelineItemVariant
  color?: string
  size?: ComponentSize
  icon?: string | Component
  hollow?: boolean
}
