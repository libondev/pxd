// source from: https://github.com/unovue/reka-ui/blob/v2/packages/core/src/shared/createContext.ts

import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

/**
 * @param providerComponentName - The name(s) of the component(s) providing the context.
 *
 * There are situations where context can come from multiple components. In such cases, you might need to give an array of component names to provide your context, instead of just a single string.
 */
export function createContext<ContextValue>(
  providerComponentName: string | string[],
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
  const injectContext = <
    T extends ContextValue | null | undefined = ContextValue,
  >(fallback?: T): T extends null ? ContextValue | null : ContextValue => {
    const context = inject(injectionKey, fallback || fallbackValue)

    if (context) {
      return context
    }

    if (context === null) {
      return context as any
    }

    throw new Error(
      `Injection \`${injectionKey.toString()}\` not found. Component must be used within ${
        Array.isArray(providerComponentName)
          ? `one of the following components: ${providerComponentName.join(
            ', ',
          )}`
          : `\`${providerComponentName}\``
      }`,
    )
  }

  return [provideContext, injectContext] as const
}
