import type { AvatarGroupProps } from '../components/avatar/types'

import { createContext } from '../utils/context'

export const [provideAvatarGroupContext, useAvatarGroupContext] = createContext<AvatarGroupProps>(
  'AvatarGroup',
  null,
)
