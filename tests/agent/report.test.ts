import type { AgentChange } from '../../src/agent/types'
import type { AgentNode } from '../../src/agent/types'
import { describe, expect, it } from 'vite-plus/test'
import { registerAgentNode } from '../../src/agent/registry'
import { notifyAgentChange, subscribeAgentChanges } from '../../src/agent/report'

const nodeOf = (patch: Partial<AgentNode> = {}): AgentNode => ({
  name: 'demo',
  el: () => null,
  actions: {},
  ...patch,
})

describe('agent report', () => {
  it('should tell a subscriber what changed and let it stop listening', () => {
    const owner = {}
    const off = registerAgentNode(nodeOf(), owner)
    const seen: AgentChange[] = []
    const stop = subscribeAgentChanges((change) => seen.push(change))

    notifyAgentChange(owner, 'Atlas')

    expect(seen).toHaveLength(1)
    expect(seen[0]).toMatchObject({ component: 'demo', value: 'Atlas' })
    expect(seen[0].details).toBeUndefined()

    stop()
    notifyAgentChange(owner, 'Later')

    expect(seen).toHaveLength(1)

    off()
  })

  it('should stay silent for a region the app hides', () => {
    const wrapper = document.createElement('div')
    const el = document.createElement('div')

    wrapper.setAttribute('data-agent-hidden', '')
    wrapper.appendChild(el)

    const owner = {}
    const off = registerAgentNode(nodeOf({ el: () => el }), owner)
    const seen: AgentChange[] = []
    const stop = subscribeAgentChanges((change) => seen.push(change))

    notifyAgentChange(owner, 'secret')

    expect(seen).toHaveLength(0)

    stop()
    off()
  })

  it('should stay silent for an inner component whose wrapper owns the element', () => {
    const el = document.createElement('div')
    const innerOwner = {}
    const offInner = registerAgentNode(nodeOf({ el: () => el }), innerOwner)
    const offWrapper = registerAgentNode(nodeOf({ el: () => el }))
    const seen: AgentChange[] = []
    const stop = subscribeAgentChanges((change) => seen.push(change))

    notifyAgentChange(innerOwner, 'from the field')

    expect(seen).toHaveLength(0)

    stop()
    offInner()
    offWrapper()
  })

  it('should say nothing for an owner that was never registered', () => {
    const seen: AgentChange[] = []
    const stop = subscribeAgentChanges((change) => seen.push(change))

    notifyAgentChange({}, 'nobody')

    expect(seen).toHaveLength(0)

    stop()
  })
})
