import type { CountdownOptions } from '../../composables/use-countdown'

export interface CountdownProps extends CountdownOptions {
  format?: string
}

export interface CountdownEmits {
  change: [enabled: boolean]
  reset: []
  finish: []
}
