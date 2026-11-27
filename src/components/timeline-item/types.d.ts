import type { ComponentSize } from '../../types/shared/props'
import type { Component } from 'vue'

export type TimelineItemTimestampPosition = 'top' | 'bottom'
export type TimelineItemVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | ''

export interface TimelineItemProps {
  timestamp?: string
  showTimestamp?: boolean
  timestampPosition?: TimelineItemTimestampPosition
  variant?: TimelineItemVariant
  color?: string
  size?: ComponentSize
  icon?: string | Component
  hollow?: boolean
}
