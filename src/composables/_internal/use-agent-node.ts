import type { AgentNode } from '../../agent/types'
import { getCurrentInstance, onMounted, onScopeDispose } from 'vue'
import { registerAgentNode } from '../../agent/registry.js'

type AgentNodeOptions = Omit<AgentNode, 'el'> & { el?: AgentNode['el'] }

// Registers the component for `snapshot`/`act`/`query` while it is mounted, so an
// agent reads the same name, state and actions the component itself declares.
export function useAgentNode(node: AgentNodeOptions) {
  const instance = getCurrentInstance()
  const el =
    node.el ??
    (() => {
      const root = instance?.vnode.el

      return root?.nodeType === 1 ? (root as Element) : undefined
    })
  let unregister: (() => void) | undefined

  onMounted(() => {
    unregister = registerAgentNode({ ...node, el })
  })

  onScopeDispose(() => {
    unregister?.()
    unregister = undefined
  })
}
