import type { AgentAllowedStep, AgentChange } from '../../src/agent'
import type { Component } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, nextTick, ref } from 'vue'
import { createAgent } from '../../src/agent'
import { registerAgentNode } from '../../src/agent/registry'
import Checkbox from '../../src/components/checkbox/index.vue'
import Input from '../../src/components/input/index.vue'

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

function mountBound(component: Component, props: Record<string, unknown>) {
  const bound = ref<unknown>(props.modelValue)

  track(
    mount(
      defineComponent({
        setup: () => () =>
          h(component, {
            ...props,
            modelValue: bound.value,
            'onUpdate:model-value': (next: unknown) => {
              bound.value = next
            },
          }),
      }),
    ),
  )

  return bound
}

describe('agent gate', () => {
  it('should ask allow about a step the app did not mark', async () => {
    const value = mountBound(Input, { modelValue: '', 'aria-label': 'Project name' })
    const asked: AgentAllowedStep[] = []
    const agent = createAgent({
      allow: (step) => {
        asked.push(step)

        return false
      },
    })

    const refused = await agent.act({
      steps: [{ ref: 'Project name', action: 'setValue', args: ['Atlas'] }],
    })

    expect(refused.ok).toBe(false)
    expect(refused.error?.message).toContain('Refused')
    expect(refused.error?.message).toContain('by the app')
    expect(value.value).toBe('')
    expect(asked).toHaveLength(1)
    expect(asked[0]).toMatchObject({ component: 'input', action: 'setValue', args: ['Atlas'] })
    expect(asked[0].signal).toBeInstanceOf(AbortSignal)
  })

  it('should say when nobody answered in time', async () => {
    const value = mountBound(Input, { modelValue: '', 'aria-label': 'Project name' })
    const agent = createAgent({ allow: () => new Promise<boolean>(() => {}), allowTimeout: 10 })

    const refused = await agent.act({
      steps: [{ ref: 'Project name', action: 'setValue', args: ['Atlas'] }],
    })

    expect(refused.ok).toBe(false)
    expect(refused.error?.message).toContain('Nobody answered in time')
    expect(value.value).toBe('')
  })

  it('should run the step once allow answers yes', async () => {
    const value = mountBound(Input, { modelValue: '', 'aria-label': 'Project name' })
    const agent = createAgent({ allow: () => true })

    const result = await agent.act({
      steps: [{ ref: 'Project name', action: 'setValue', args: ['Atlas'] }],
    })

    expect(result.ok).toBe(true)
    expect(value.value).toBe('Atlas')
  })

  it('should fail a marked step when no allow can answer for the person', async () => {
    const value = mountBound(Input, {
      modelValue: '',
      'aria-label': 'Account',
      'data-agent-confirm': 'Changes the account',
    })
    const agent = createAgent()

    const result = await agent.act({
      steps: [{ ref: 'Account', action: 'setValue', args: ['other'] }],
    })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toContain('Needs a person: Changes the account')
    expect(value.value).toBe('')
  })

  it('should let allow answer for a marked step', async () => {
    const value = mountBound(Input, {
      modelValue: '',
      'aria-label': 'Account',
      'data-agent-confirm': 'Changes the account',
    })
    const agent = createAgent({ allow: (step) => step.confirm === 'Changes the account' })

    const result = await agent.act({
      steps: [{ ref: 'Account', action: 'setValue', args: ['other'] }],
    })

    expect(result.ok).toBe(true)
    expect(value.value).toBe('other')
  })

  it('should take the actions away from a disabled component and refuse it', async () => {
    const value = mountBound(Input, {
      modelValue: '',
      disabled: true,
      'aria-label': 'Locked',
    })
    const agent = createAgent()
    const entry = find(agent.snapshot(), 'input')

    expect(entry).toMatchObject({ disabled: true, actions: [] })

    const result = await agent.act({ steps: [{ ref: entry.ref, action: 'setValue', args: ['x'] }] })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toContain('disabled now')
    expect(value.value).toBe('')
  })

  it('should never read a secret value, in a snapshot or in a change', async () => {
    const value = mountBound(Input, {
      modelValue: '',
      password: true,
      'aria-label': 'Password',
    })
    const agent = createAgent()
    const changes: AgentChange[] = []

    agent.subscribe((change) => changes.push(change))

    await agent.act({ steps: [{ ref: 'Password', action: 'setValue', args: ['hunter2'] }] })
    await nextTick()

    expect(value.value).toBe('hunter2')
    expect(changes).toHaveLength(1)
    expect(changes[0]).toMatchObject({ key: 'value', value: '[redacted]' })
    expect(find(agent.snapshot(), 'input')).toMatchObject({ value: '[redacted]' })
  })

  it('should say which key changed and what it held before', async () => {
    mountBound(Checkbox, { modelValue: false, 'aria-label': 'Done' })
    const agent = createAgent()
    const changes: AgentChange[] = []

    agent.subscribe((change) => changes.push(change))

    await agent.act({ steps: [{ ref: 'Done', action: 'toggle' }] })

    expect(changes[0]).toMatchObject({ key: 'checked', value: true, previous: false })
  })

  it('should leave a region marked aria-hidden out of the snapshot', async () => {
    track(
      mount(
        defineComponent({
          setup: () => () =>
            h('div', { 'aria-hidden': 'true' }, [
              h(Input, { modelValue: '', 'aria-label': 'Hidden field' }),
            ]),
        }),
      ),
    )
    const agent = createAgent()

    expect(agent.snapshot().some((entry) => entry.label === 'Hidden field')).toBe(false)
  })

  it('should leave the content of a closed section out, until it opens', async () => {
    const open = ref(false)

    track(
      mount(
        defineComponent({
          setup: () => () =>
            h('div', [
              h('details', { open: open.value }, [
                h('summary', {}, 'More'),
                h(Input, { modelValue: '', 'aria-label': 'Inside' }),
              ]),
            ]),
        }),
      ),
    )
    const agent = createAgent()

    expect(agent.snapshot().some((entry) => entry.label === 'Inside')).toBe(false)

    open.value = true
    await nextTick()

    expect(agent.snapshot().some((entry) => entry.label === 'Inside')).toBe(true)
  })

  it('should name a button without the text a screen reader skips', () => {
    const root = document.createElement('div')
    const button = document.createElement('button')

    button.append('Save')

    const icon = document.createElement('span')

    icon.setAttribute('aria-hidden', 'true')
    icon.textContent = ' *'
    button.append(icon)
    root.append(button)
    register({ name: 'demo', el: () => root, actions: {} })

    expect(find(createAgent().snapshot(), 'demo').buttons).toEqual(['Save'])
  })
})
