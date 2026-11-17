import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, nextTick, ref } from 'vue'
import { agentTools, createAgent } from '../../src/agent'
import { registerAgentNode } from '../../src/agent/registry'
import Input from '../../src/components/input/index.vue'
import Modal from '../../src/components/modal/index.vue'
import Select from '../../src/components/select/index.vue'

const mounted: { unmount: () => void }[] = []
const registered: (() => void)[] = []

const track = <T extends { unmount: () => void }>(wrapper: T) => {
  mounted.push(wrapper)

  return wrapper
}

const register = (node: Parameters<typeof registerAgentNode>[0]) => {
  const off = registerAgentNode(node)

  registered.push(off)

  return off
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  registered.splice(0).forEach((off) => off())
})

const find = <T extends { component: string }>(entries: T[], component: string) =>
  entries.find((entry) => entry.component === component)!

describe('agent boundaries', () => {
  it('should refuse a hidden component even when the step names its ref', async () => {
    const hidden = ref(false)
    const value = ref('')
    track(
      mount(
        defineComponent({
          setup: () => () =>
            h('div', { 'data-agent-hidden': hidden.value ? '' : undefined }, [
              h(Input, {
                modelValue: value.value,
                'aria-label': 'Private field',
                'onUpdate:model-value': (next: unknown) => {
                  value.value = next == null ? '' : String(next as string | number)
                },
              }),
            ]),
        }),
      ),
    )
    const agent = createAgent()
    const entry = find(agent.snapshot(), 'input')

    hidden.value = true
    await nextTick()

    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'setValue', args: ['changed'] }],
    })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toContain('No component matches')
    expect(value.value).toBe('')
    expect(agent.snapshot().some((item) => item.ref === entry.ref)).toBe(false)
    expect(agent.query({ kind: 'input' })).toHaveLength(0)
  })

  it('should leave hidden buttons out of the snapshot and out of press', async () => {
    const root = document.createElement('div')
    const visible = document.createElement('button')

    visible.textContent = 'Visible'

    const hiddenWrap = document.createElement('div')
    const hidden = document.createElement('button')

    hiddenWrap.setAttribute('data-agent-hidden', '')
    hidden.textContent = 'Secret action'
    hiddenWrap.appendChild(hidden)
    root.append(visible, hiddenWrap)

    register({ name: 'demo', el: () => root, actions: {} })
    const agent = createAgent()
    const entry = find(agent.snapshot(), 'demo')

    expect(entry.buttons).toEqual(['Visible'])

    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'press', args: ['Secret action'] }],
    })

    expect(result.ok).toBe(false)
  })

  it('should ask before opening a dialog that has not rendered yet', async () => {
    const open = ref(false)
    const asked: string[] = []
    track(
      mount(
        defineComponent({
          setup: () => () =>
            h('div', { 'data-agent-confirm': 'Opens the settings' }, [
              h(Modal, {
                modelValue: open.value,
                title: 'Settings',
                'onUpdate:model-value': (next: unknown) => {
                  open.value = Boolean(next)
                },
              }),
            ]),
        }),
      ),
    )
    const agent = createAgent({
      allow: (step) => {
        asked.push(step.confirm ?? '')

        return true
      },
    })
    const entry = find(agent.snapshot(), 'modal')

    expect(entry.confirm).toBe('Opens the settings')

    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'setOpen', args: [true] }],
    })

    expect(result.ok).toBe(true)
    expect(asked).toEqual(['Opens the settings'])
  })

  it('should not print a secret component choices either', () => {
    track(
      mount(Select, {
        props: { options: [{ label: 'Atlas account', value: 'atlas' }] },
        attrs: { 'aria-label': 'Accounts', 'data-agent-secret': '' },
      }),
    )
    const entry = find(createAgent().snapshot(), 'select')

    expect(entry.value).toBe('[redacted]')
    expect(entry.label).toBeUndefined()
    expect(entry.items).toBeUndefined()
    expect(entry.buttons).toBeUndefined()
  })

  it('should keep a snapshot when a component getter throws', () => {
    register({
      name: 'broken',
      el: () => document.createElement('div'),
      state: () => {
        throw new Error('state failed')
      },
      items: () => {
        throw new Error('items failed')
      },
      actions: {},
    })
    const agent = createAgent()

    const snapshot = agent.snapshot()

    expect(find(snapshot, 'broken')).toMatchObject({ incomplete: true })
    expect(() => agent.query({ text: 'Atlas' })).not.toThrow()
  })

  it('should name a choice that matched past the snapshot cut', () => {
    const items = Array.from({ length: 120 }, (_, index) => ({
      label: index === 110 ? 'Atlas' : `Row ${index}`,
      value: index,
    }))

    register({
      name: 'long-list',
      el: () => document.createElement('div'),
      items: () => items,
      actions: {},
    })

    const found = createAgent().query({ text: 'Atlas' })
    const entry = find(found, 'long-list')

    expect(entry.matchedItems).toEqual(['Atlas'])
    expect(entry.items).toHaveLength(100)
    expect(entry.itemCount).toBe(120)
  })

  it('should tell a model where an action name comes from', () => {
    const act = agentTools.find((tool) => tool.name === 'act')!
    const properties = act.inputSchema.properties as {
      steps: { items: { properties: { action: { description: string } } } }
    }
    const action = properties.steps.items.properties.action.description

    expect(action).toContain('actions')
    expect(action).toContain('press')
  })
})
