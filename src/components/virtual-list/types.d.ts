import type { VirtualListOptions } from '../../composables/use-virtual-list'
import type { ComponentClass } from '../../types/shared/props'

export interface VirtualListProps extends VirtualListOptions {
  listClass?: ComponentClass
  itemClass?: ComponentClass
  errorText?: ComponentLabel
  loadingText?: ComponentLabel
  finishedText?: ComponentLabel
}

export interface VirtualListEmits {
  retry: []
}
