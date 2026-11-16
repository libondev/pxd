import type { AgentNode } from '../../agent/types'
import { onMounted, onScopeDispose } from 'vue'
import { registerAgentNode } from '../../agent/registry.js'

// Registers the component for `snapshot`/`act`/`query` while it is mounted, so an
// agent reads the same name, state and actions the component itself declares.
export function useAgentNode(node: AgentNode) {
  let unregister: (() => void) | undefined

  onMounted(() => {
    unregister = registerAgentNode(node)
  })

  onScopeDispose(() => {
    unregister?.()
    unregister = undefined
  })
}
