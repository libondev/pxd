import type { Callback } from '../../types/shared/utils'

export type ColorScheme = 'auto' | 'dark' | 'light'

export class ColorSchemeSystem {
  static instance: ColorSchemeSystem

  constructor(
    private _isPreferredDark: boolean = false,
    private callbackList: Array<(mode: ColorScheme, byUser: boolean) => void> = [],
    private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)'),
    private scheduler = (ev: MediaQueryListEvent) => {
      this._isPreferredDark = ev.matches
      this.emit(ev.matches ? 'dark' : 'light', false)
    },
  ) {
    if (ColorSchemeSystem.instance) {
      return ColorSchemeSystem.instance
    }

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    this.mediaQuery.addEventListener('change', this.scheduler)
    this._isPreferredDark = this.mediaQuery.matches

    ColorSchemeSystem.instance = this
  }

  get isPreferredDark() {
    return this._isPreferredDark
  }

  on(cb: Callback) {
    this.callbackList.push(cb)
  }

  off(cb: Callback) {
    this.callbackList.splice(this.callbackList.indexOf(cb), 1)

    if (this.callbackList.length <= 0) {
      this.mediaQuery.removeEventListener('change', this.scheduler)
    }
  }

  emit(mode: ColorScheme, byUser: boolean = true) {
    this.callbackList.forEach(cb => cb(mode, byUser))
  }
}
