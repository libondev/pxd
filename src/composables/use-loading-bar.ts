// Part of the realization comes from: https://github.com/rstacruz/nprogress

export const UPDATE_LOADING_BAR_EVENT_NAME = '#update-loading-bar'

export type LoadingBarActionType = 'start' | 'error' | 'finish' | 'increase'

export interface LoadingBarEventParams {
  type: LoadingBarActionType
  group: string
  value?: number
}

interface Options extends LoadingBarEventParams {}

export function useLoadingBar(options: Options) {
  window.dispatchEvent(new CustomEvent(UPDATE_LOADING_BAR_EVENT_NAME, { detail: options }))
}

useLoadingBar.start = function (group: string = 'default') {
  useLoadingBar({ type: 'start', group })
}

useLoadingBar.error = function (group: string = 'default') {
  useLoadingBar({ type: 'error', group })
}

useLoadingBar.finish = function (group: string = 'default') {
  useLoadingBar({ type: 'finish', group })
}

useLoadingBar.increase = function (group: string = 'default', value?: number) {
  useLoadingBar({ type: 'increase', group, value })
}
