import type { AvatarGroupProps } from '../components/avatar-group/types'
import { createContext } from '../utils/_internal/context.js'

export interface AvatarGroupContext {
  props: AvatarGroupProps
}

export const [provideAvatarGroupContext, useAvatarGroupContext] = createContext<AvatarGroupContext>(
  'AvatarGroup',
  null,
)
