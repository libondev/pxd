import type { UseCountdownOptions } from '../../composables/use-countdown'

export interface CountdownProps extends UseCountdownOptions {
  format?: string
}

export interface CountdownEmits {
  change: [active: boolean]
  reset: []
  finish: []
}
