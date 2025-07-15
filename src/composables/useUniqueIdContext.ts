import { inject, provide } from 'vue'
import { getUniqueId } from '../utils/uid'

export function provideUniqueId(provideKey: string = 'uniqueId'): string {
  const uniqueId = getUniqueId()

  provide(provideKey, uniqueId)

  return uniqueId
}

export function useUniqueId(provideKey: string = 'uniqueId'): string {
  const injectedValue = inject(provideKey, getUniqueId())

  return injectedValue
}
