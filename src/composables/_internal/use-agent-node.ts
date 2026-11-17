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
  // A dialog renders nothing while closed, but its Vue anchor still sits inside the app's
  // confirm/secret/hidden region. Marks are read from the anchor when there is no element.
  const scope = () => {
    const root = instance?.vnode.el

    return el() ?? (root && 'parentElement' in root ? (root.parentElement as Element | null) : null)
  }
  let unregister: (() => void) | undefined

  onMounted(() => {
    unregister = registerAgentNode({ ...node, el, scope }, instance ?? undefined)
  })

  onScopeDispose(() => {
    unregister?.()
    unregister = undefined
  })
}
