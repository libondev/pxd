import type { VirtualListOptions } from '../../composables/use-virtual-list'

export interface VirtualListProps extends VirtualListOptions {
  errorMessage?: string
  loadingMessage?: string
  finishedMessage?: string
}

export interface VirtualListEmits {
  retry: []
  'reach-bottom': []
}
