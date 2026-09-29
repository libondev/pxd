import type { AvatarGroupProps } from '../components/avatar-group/types'
import { createContext } from '../utils/context.js'

export interface AvatarGroupContext {
  props: AvatarGroupProps
}

export const [provideAvatarGroupContext, useAvatarGroupContext] = createContext<AvatarGroupContext>(
  'AvatarGroup',
  null,
)
