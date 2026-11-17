import type { AgentNode } from '../../src/agent'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { createAgent } from '../../src/agent'
import { registerAgentNode } from '../../src/agent/registry'

const registered: (() => void)[] = []

const register = (node: AgentNode) => {
  const off = registerAgentNode(node)

  registered.push(off)

  return off
}

afterEach(() => {
  registered.splice(0).forEach((off) => off())
  document.body.innerHTML = ''
})

const find = <T extends { component: string }>(entries: T[], component: string) =>
  entries.find((entry) => entry.component === component)!

const host = () => document.createElement('div')

describe('agent targeting', () => {
  it('should return one component with its own choices from within', () => {
    const root = host()

    root.textContent = 'Items'
    register({
      name: 'list',
      el: () => root,
      items: () =>
        Array.from({ length: 150 }, (_, index) => ({ label: `Row ${index}`, value: `v${index}` })),
      state: () => ({ value: 'v0' }),
      actions: { setValue: () => {} },
    })
    const agent = createAgent()
    const entry = find(agent.snapshot(), 'list')

    expect(entry.items).toHaveLength(100)
    expect(entry.itemCount).toBe(150)

    const [found] = agent.query({ within: entry.ref })

    expect(found.items).toHaveLength(50)
    expect(found.more).toBe(100)
  })

  it('should take a choice by its label and refuse one a closed list does not have', async () => {
    const root = host()
    let chosen: unknown

    register({
      name: 'select',
      el: () => root,
      closed: true,
      items: () => [
        { label: 'Europe', value: 'eu' },
        { label: 'Asia', value: 'as' },
      ],
      state: () => ({ value: null }),
      actions: {
        setValue: (value) => {
          chosen = value
        },
      },
    })
    const agent = createAgent()
    const entry = find(agent.snapshot(), 'select')

    expect(
      (await agent.act({ steps: [{ ref: entry.ref, action: 'setValue', args: ['Europe'] }] })).ok,
    ).toBe(true)
    expect(chosen).toBe('eu')

    const refused = await agent.act({
      steps: [{ ref: entry.ref, action: 'setValue', args: ['Africa'] }],
    })

    expect(refused.ok).toBe(false)
    expect(refused.error?.message).toContain('No item "Africa"')
    expect(refused.error?.message).toContain('Europe')
  })

  it('should refuse a string where a checkbox takes true or false', async () => {
    const root = host()

    register({
      name: 'checkbox',
      el: () => root,
      state: () => ({ checked: false }),
      actions: { setValue: () => {} },
    })
    const agent = createAgent()
    const entry = find(agent.snapshot(), 'checkbox')
    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'setValue', args: ['true'] }],
    })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toContain('takes true or false')
  })

  it('should read a number out of the text a model writes', async () => {
    const root = host()
    let chosen: unknown

    register({
      name: 'slider',
      el: () => root,
      state: () => ({ value: 0, min: 0, max: 100 }),
      actions: {
        setValue: (value) => {
          chosen = value
        },
      },
    })
    const agent = createAgent()
    const entry = find(agent.snapshot(), 'slider')

    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'setValue', args: ['40'] }],
    })

    expect(result.ok).toBe(true)
    expect(chosen).toBe(40)
  })

  it('should report the text on a component row and find it by that text', async () => {
    const row = document.createElement('li')
    const button = document.createElement('button')
    let pressed = false

    row.append('Jane Doe')
    button.textContent = 'Actions'
    button.addEventListener('click', () => {
      pressed = true
    })
    row.append(button)
    document.body.append(row)
    register({ name: 'menu', el: () => button, actions: {} })

    const agent = createAgent()
    const entry = find(agent.snapshot(), 'menu')

    expect(entry).toMatchObject({ label: 'Actions', row: 'Jane Doe' })

    const result = await agent.act({ steps: [{ ref: 'Jane Doe', action: 'press' }] })

    expect(result.ok).toBe(true)
    expect(pressed).toBe(true)
  })

  it('should not read the choices at all when a snapshot leaves them out', () => {
    const root = host()
    let reads = 0

    register({
      name: 'list',
      el: () => root,
      items: () => {
        reads += 1

        return [{ label: 'Row', value: 'r' }]
      },
      state: () => ({ value: 'r' }),
      actions: {},
    })

    createAgent().snapshot({ items: false })

    expect(reads).toBe(0)
  })

  it('should stop a long snapshot at the limit and name what it left out', () => {
    for (let index = 0; index < 120; index++) {
      const root = host()

      root.textContent = `Chip ${index}`
      register({ name: 'chip', label: () => `Chip ${index}`, el: () => root, actions: {} })
    }

    const entries = createAgent().snapshot()

    expect(entries).toHaveLength(101)
    expect(entries.at(-1)).toMatchObject({
      ref: 'more',
      component: 'more',
      more: 20,
      use: 'query',
      sample: ['Chip 100', 'Chip 101', 'Chip 102'],
    })
  })

  it('should report the fields a run touched, and count the ones it left out', async () => {
    const root = host()

    register({
      name: 'panel',
      el: () => root,
      state: () => ({ value: 'closed' }),
      actions: {
        open: () => {
          const child = document.createElement('span')

          root.append(child)
          register({
            name: 'chip',
            el: () => child,
            state: () => ({ value: 'inside' }),
            actions: {},
          })
        },
      },
    })
    const agent = createAgent()
    const entry = find(agent.snapshot(), 'panel')

    const result = await agent.act({ steps: [{ ref: entry.ref, action: 'open' }] })

    expect(result.ok).toBe(true)
    expect(result.appeared.map((component) => component.component)).toContain('chip')

    // The panel is the field the step touched; the chip it brought on was never touched,
    // so it is counted rather than listed — an agent reads it from `appeared` or a snapshot.
    expect(result.values).toEqual({ [`${entry.ref} panel`]: 'closed', more: 1 })
  })

  it('should wait for a component whose own work is running', async () => {
    const root = host()
    let pending = false

    register({
      name: 'job',
      el: () => root,
      state: () => ({ value: 'idle' }),
      pending: () => pending,
      actions: {
        run: () => {
          pending = true
          setTimeout(() => {
            pending = false
          }, 30)
        },
      },
    })
    const agent = createAgent()
    const entry = find(agent.snapshot(), 'job')
    const result = await agent.act({ steps: [{ ref: entry.ref, action: 'run' }] })

    expect(result.ok).toBe(true)
    expect(result.results[0].result).toBeNull()
    expect(pending).toBe(false)
  })

  it('should find a component by its kind and by a choice inside it', async () => {
    const slider = host()
    const select = host()
    const chosen: unknown[] = []

    register({
      name: 'slider',
      el: () => slider,
      state: () => ({ value: 10 }),
      actions: {
        setValue: (value) => {
          chosen.push(value)
        },
      },
    })
    register({
      name: 'select',
      el: () => select,
      closed: true,
      items: () => [{ label: 'Europe', value: 'eu' }],
      state: () => ({ value: null }),
      actions: {
        setValue: (value) => {
          chosen.push(value)
        },
      },
    })
    const agent = createAgent()

    expect(
      (await agent.act({ steps: [{ ref: 'slider', action: 'setValue', args: [30] }] })).ok,
    ).toBe(true)
    expect(
      (await agent.act({ steps: [{ ref: 'Europe', action: 'setValue', args: ['eu'] }] })).ok,
    ).toBe(true)
    expect(chosen).toEqual([30, 'eu'])
  })

  it('should report what a step changed and what it took off the page', async () => {
    const root = host()
    const chip = host()
    let value = ''

    register({
      name: 'field',
      el: () => root,
      state: () => ({ value }),
      actions: {
        setValue: (next) => {
          value = String(next)
        },
      },
    })

    const removeChip = register({
      name: 'chip',
      el: () => chip,
      state: () => ({ value: 'inside' }),
      actions: {},
    })

    register({
      name: 'panel',
      el: () => host(),
      state: () => ({ open: true }),
      actions: { close: () => removeChip() },
    })

    const agent = createAgent()
    const field = find(agent.snapshot(), 'field')
    const panel = find(agent.snapshot(), 'panel')
    const chipRef = find(agent.snapshot(), 'chip').ref

    const written = await agent.act({
      steps: [{ ref: field.ref, action: 'setValue', args: ['Atlas'] }],
    })

    expect(written.results[0].changes).toEqual([
      { ref: field.ref, component: 'field', key: 'value', value: 'Atlas' },
    ])

    const closed = await agent.act({ steps: [{ ref: panel.ref, action: 'close' }] })

    expect(closed.results[0].gone).toEqual([`${chipRef} chip`])
  })

  it('should fail a step whose component reports an error', async () => {
    const root = host()

    register({
      name: 'job',
      el: () => root,
      state: () => ({ value: 'idle' }),
      error: () => new Error('the save failed'),
      actions: { run: () => {} },
    })
    const agent = createAgent()
    const entry = find(agent.snapshot(), 'job')
    const result = await agent.act({ steps: [{ ref: entry.ref, action: 'run' }] })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toContain('the save failed')
  })
})
