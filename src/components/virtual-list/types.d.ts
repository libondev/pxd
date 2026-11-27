import type { VirtualListOptions } from '../../composables/use-virtual-list'
import type { ComponentClass, ComponentText } from '../../types/shared/props'

export interface VirtualListProps extends Omit<VirtualListOptions, 'enabled'> {
  enabled?: boolean
  listClass?: ComponentClass
  itemClass?: ComponentClass
  errorMessage?: ComponentText
  loadingText?: ComponentText
  finishedText?: ComponentText
}

export interface VirtualListEmits {
  retry: []
}
