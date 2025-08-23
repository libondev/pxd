// Part of the realization comes from: https://github.com/rstacruz/nprogress

export const START_LOADING_BAR_EVENT_NAME = '#start-loading-bar'
export const ERROR_LOADING_BAR_EVENT_NAME = '#error-loading-bar'
export const FINISH_LOADING_BAR_EVENT_NAME = '#finish-loading-bar'
export const INCREASE_LOADING_BAR_EVENT_NAME = '#increase-loading-bar'

const LOADING_BAR_EVENTS = {
  start: START_LOADING_BAR_EVENT_NAME,
  error: ERROR_LOADING_BAR_EVENT_NAME,
  finish: FINISH_LOADING_BAR_EVENT_NAME,
  increase: INCREASE_LOADING_BAR_EVENT_NAME,
} as const

interface Options extends Record<string, any> {
  type?: keyof typeof LOADING_BAR_EVENTS
}

export interface LoadingBarEventParams {
  group: string
  value?: number
}

export function useLoadingBar(options: Options = {}) {
  const { type = 'start', ...data } = options
  const event = LOADING_BAR_EVENTS[type]

  window.dispatchEvent(new CustomEvent(event, { detail: data }))
}

useLoadingBar.start = function (group?: string) {
  useLoadingBar({ type: 'start', group })
}

useLoadingBar.error = function (group?: string) {
  useLoadingBar({ type: 'error', group })
}

useLoadingBar.finish = function (group?: string) {
  useLoadingBar({ type: 'finish', group })
}

useLoadingBar.increase = function (group?: string, value?: number) {
  useLoadingBar({ type: 'increase', group, value })
}
