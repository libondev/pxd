import type { AgentNode } from '../../src/agent/types'
import { describe, expect, it } from 'vite-plus/test'
import {
  agentEntries,
  agentEntry,
  agentEntryOf,
  agentLabel,
  agentOwnerEntry,
  agentVisibleEntries,
  registerAgentNode,
} from '../../src/agent/registry'

const nodeOf = (patch: Partial<AgentNode> = {}): AgentNode => ({
  name: 'demo',
  el: () => null,
  actions: {},
  ...patch,
})

const registered = (...nodes: { node: AgentNode; owner?: object }[]) =>
  nodes.map(({ node, owner }) => registerAgentNode(node, owner))

describe('agent registry', () => {
  it('should hand out a ref, keep it findable, and take it back', () => {
    const owner = {}
    const off = registerAgentNode(nodeOf(), owner)
    const entry = agentEntryOf(owner)

    expect(entry?.ref).toMatch(/^c\d+$/)
    expect(agentEntry(entry!.ref)).toBe(entry)
    expect(agentLabel(entry!.node)).toBeUndefined()

    off()

    expect(agentEntry(entry!.ref)).toBeUndefined()
    expect(agentEntryOf(owner)).toBeUndefined()
  })

  it('should give each registration its own ref and order', () => {
    const offs = registered({ node: nodeOf() }, { node: nodeOf() })
    const [first, second] = agentEntries().slice(-2)

    expect(first.ref).not.toBe(second.ref)
    expect(second.order).toBeGreaterThan(first.order)

    offs.forEach((off) => off())
  })

  it('should let a wrapper own the element a nested component also holds', () => {
    const el = document.createElement('div')
    const offs = registered({ node: nodeOf({ el: () => el }) }, { node: nodeOf({ el: () => el }) })
    const [inner, wrapper] = agentEntries().slice(-2)

    expect(agentOwnerEntry(inner)).toBe(wrapper)
    expect(agentOwnerEntry(wrapper)).toBe(wrapper)
    expect(agentVisibleEntries()).toContain(wrapper)
    expect(agentVisibleEntries()).not.toContain(inner)

    offs.forEach((off) => off())
  })

  it('should absorb the entries a component says are its own part', () => {
    const outer = document.createElement('div')
    const inner = document.createElement('div')
    const ownEl = () => outer
    const partEl = () => inner

    outer.append(inner)

    const offs = registered(
      { node: nodeOf({ el: ownEl, owns: () => inner }) },
      { node: nodeOf({ el: partEl }) },
    )
    const visible = agentVisibleEntries()

    expect(visible).toContain(agentEntries().find((entry) => entry.node.el === ownEl))
    expect(visible).not.toContain(agentEntries().find((entry) => entry.node.el === partEl))

    offs.forEach((off) => off())
  })

  it('should own its own element when nothing shares it', () => {
    const offs = registered({ node: nodeOf({ el: () => document.createElement('div') }) })
    const entry = agentEntries().at(-1)!

    expect(agentOwnerEntry(entry)).toBe(entry)
    expect(agentVisibleEntries()).toContain(entry)

    offs.forEach((off) => off())
  })

  it('should name a component from what its element answers to', () => {
    const el = document.createElement('div')

    el.setAttribute('aria-label', 'Project name')

    const offs = registered({ node: nodeOf({ el: () => el }) })

    expect(agentLabel(agentEntries().at(-1)!.node)).toBe('Project name')

    offs.forEach((off) => off())
  })
})
