import type { VirtualListOptions } from '../../composables/use-virtual-list'
import type { ComponentClass } from '../../types/shared/props'

export interface VirtualListProps extends VirtualListOptions {
  listClass?: ComponentClass
  itemClass?: ComponentClass
  errorText?: ComponentText
  loadingText?: ComponentText
  finishedText?: ComponentText
}

export interface VirtualListEmits {
  retry: []
}
