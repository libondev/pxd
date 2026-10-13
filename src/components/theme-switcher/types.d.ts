import type { ColorPreference } from '../../composables/use-color-scheme'

export interface ThemeSwitcherEmits {
  toggle: [ColorPreference]
}
