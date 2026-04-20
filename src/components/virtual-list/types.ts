import type { VirtualListOptions } from '../../composables/use-virtual-list'
import type { ComponentClass } from '../../types/shared/props'

export interface VirtualListProps extends VirtualListOptions {
  listClass?: ComponentClass
  itemClass?: ComponentClass
  errorText?: string
  loadingText?: string
  finishedText?: string
}

export interface VirtualListEmits {
  retry: []
  bottom: []
}
