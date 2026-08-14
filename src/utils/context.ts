import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'
import { isUndefined } from './is.js'

type InjectContextStrict<T> = ((fallback?: T) => T) & ((fallback: null) => T | null)

/**
 * @param providerComponentName - The name of the component providing the context.
 * @param fallbackValue - If the component is allowed to be used alone, you need to pass in null manually, otherwise leave it blank.
 */
export function createContext<ContextValue>(
  providerComponentName: string,
): readonly [(contextValue: ContextValue) => ContextValue, InjectContextStrict<ContextValue>]
export function createContext<ContextValue>(
  providerComponentName: string,
  fallbackValue: ContextValue,
): readonly [(contextValue: ContextValue) => ContextValue, InjectContextStrict<ContextValue>]
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

    if (isUndefined(context)) {
      throw new Error(
        `Injection \`${injectionKey.toString()}\` not found. Component must be used within \`${providerComponentName}\``,
      )
    }

    return context
  }

  return [provideContext, injectContext] as const
}
