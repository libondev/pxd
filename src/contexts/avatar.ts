import type { AvatarGroupProps } from '../types/components/avatar'
import { createContext } from '../utils/context'

export const [
  provideAvatarGroupContext,
  useAvatarGroupContext,
] = createContext<AvatarGroupProps>('AvatarGroup')
