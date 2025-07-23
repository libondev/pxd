import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

type InjectContextStrict<T> = ((fallback?: T) => T) & ((fallback: null) => T | null)

/**
 * @param providerComponentName - The name of the component providing the context.
 */
export function createContext<ContextValue>(
  providerComponentName: string,
): readonly [
  (contextValue: ContextValue) => ContextValue,
  InjectContextStrict<ContextValue>,
]
export function createContext<ContextValue>(
  providerComponentName: string,
  fallbackValue: ContextValue,
): readonly [
  (contextValue: ContextValue) => ContextValue,
  InjectContextStrict<ContextValue>,
]
export function createContext<ContextValue>(
  providerComponentName: string,
  fallbackValue: null,
): readonly [
  (contextValue: ContextValue) => ContextValue,
  (fallback?: ContextValue | null) => ContextValue | null,
]
export function createContext<ContextValue>(
  providerComponentName: string,
  fallbackValue?: ContextValue | null,
) {
  const symbolDescription = `${providerComponentName}Context`

  const injectionKey: InjectionKey<ContextValue | null> = Symbol(symbolDescription)

  const provideContext = (contextValue: ContextValue) => {
    provide(injectionKey, contextValue)
    return contextValue
  }

  /**
   *
   * @throws When context injection failed and no fallback is specified.
   * This happens when the component injecting the context is not a child of the root component providing the context.
   */
  const injectContext = (fallback?: ContextValue | null) => {
    const context = inject(injectionKey, fallback ?? fallbackValue)

    if (context === undefined) {
      throw new Error(
        `Injection \`${injectionKey.toString()}\` not found. Component must be used within \`${providerComponentName}\``,
      )
    }

    return context
  }

  return [provideContext, injectContext] as const
}
