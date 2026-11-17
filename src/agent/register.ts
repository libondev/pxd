import type { AgentActOptions, AgentAllow, AgentBridge } from './types'
import { agentCallers } from './callers.js'
import { agentTools } from './tools.js'

interface ModelContext {
  registerTool: (tool: object, options: { signal: AbortSignal }) => Promise<void>
}

// What the browser's agent needs to know before it calls a tool: a read changes nothing,
// everything it reads is page text it did not write, and an act can change the app.
const annotationsOf = (name: string) => ({
  readOnlyHint: name !== 'act',
  untrustedContentHint: true,
  consequentialHint: name === 'act',
})

/**
 * Hands the bridge's three tools to the browser's own agent through WebMCP, where the
 * browser has it, and does nothing where it does not. Returns a function that unregisters
 * them. `allow` is required: that agent is not the app's, so it decides every step after the
 * bridge's own check.
 */
export function registerTools(agent: AgentBridge, { allow }: { allow: AgentAllow }) {
  if (typeof allow !== 'function') {
    throw new Error('registerTools needs an `allow` that decides each step.')
  }

  const context = (globalThis.document as { modelContext?: ModelContext } | undefined)?.modelContext

  if (!context) {
    return () => {}
  }

  const controller = new AbortController()
  const call = agentCallers.get(agent)

  for (const tool of agentTools) {
    const run = agent[tool.name] as (input: unknown) => unknown

    void context
      .registerTool(
        {
          ...tool,
          annotations: annotationsOf(tool.name),
          execute: (input: unknown, options?: { signal?: AbortSignal }) =>
            tool.name === 'act'
              ? call?.(input as AgentActOptions, allow, options?.signal)
              : run(input),
        },
        { signal: controller.signal },
      )
      .catch((error: unknown) => {
        console.warn(`[pxd] registerTools could not register "${tool.name}"`, error)
      })
  }

  return () => controller.abort()
}
