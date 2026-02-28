import type { VirtualListOptions } from '../../composables/use-virtual-list'

export interface VirtualListProps extends VirtualListOptions {
  errorText?: string
  loadingText?: string
  finishedText?: string
}

export interface VirtualListEmits {
  retry: []
  bottom: []
}
