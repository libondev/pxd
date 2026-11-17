import type { AgentEntry } from '../../src/agent/registry'
import type { AgentItem } from '../../src/agent/types'
import { describe, expect, it } from 'vite-plus/test'
import { describe as describeComponent } from '../../src/agent/describe'

const entryOf = (state: Record<string, unknown>, items?: AgentItem[]): AgentEntry => ({
  ref: 'c1',
  order: 1,
  node: {
    name: 'demo',
    el: () => null,
    state: () => state,
    items: () => items,
    actions: { setValue: () => {} },
  },
})

describe('agent describe', () => {
  it('should keep the state the component reports', () => {
    expect(describeComponent(entryOf({ value: 1 }))).toMatchObject({
      ref: 'c1',
      component: 'demo',
      value: 1,
      actions: ['setValue'],
    })
  })

  it('should take the actions away from a disabled component', () => {
    expect(describeComponent(entryOf({ value: 1, disabled: true }))).toMatchObject({
      ref: 'c1',
      component: 'demo',
      disabled: true,
      actions: [],
    })
  })

  it('should drop a state key that would overwrite what makes it addressable', () => {
    const described = describeComponent(
      entryOf({ ref: 'c9', component: 'evil', label: 'x', actions: [], value: 2 }),
    )

    expect(described).toMatchObject({
      ref: 'c1',
      component: 'demo',
      value: 2,
      actions: ['setValue'],
    })
    expect(described.label).toBeUndefined()
  })

  it('should cut items at the limit and keep the count', () => {
    const items = Array.from({ length: 120 }, (_, index) => ({ label: `Row ${index}` }))
    const described = describeComponent(entryOf({}, items))

    expect(described.items).toHaveLength(100)
    expect(described.itemCount).toBe(120)
  })
})
