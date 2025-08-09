import { inject, provide } from 'vue'
import { getUniqueId } from '../utils/uid'

export function provideUniqueId(injectionKey: string = 'uniqueId'): string {
  const uniqueId = getUniqueId()

  provide(injectionKey, uniqueId)

  return uniqueId
}

export function useUniqueId(injectionKey: string = 'uniqueId'): string {
  const injectedValue = inject(injectionKey, getUniqueId())

  return injectedValue
}
