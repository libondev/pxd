import type { AgentChange } from '../../src/agent'
import type { Component } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, ref } from 'vue'
import { createAgent, createHistory, elementOf, observe, stageChanges } from '../../src/agent'
import Input from '../../src/components/input/index.vue'

const mounted: { unmount: () => void }[] = []
const stops: (() => void)[] = []

const track = <T extends { unmount: () => void }>(wrapper: T) => {
  mounted.push(wrapper)

  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  stops.splice(0).forEach((stop) => stop())
})

const find = <T extends { component: string }>(entries: T[], component: string) =>
  entries.find((entry) => entry.component === component)!

function mountBound(
  component: Component,
  label: string,
  initial: unknown,
  props: Record<string, unknown> = {},
) {
  const bound = ref<unknown>(initial)

  track(
    mount(
      defineComponent({
        setup: () => () =>
          h(component, {
            ...props,
            modelValue: bound.value,
            'aria-label': label,
            'onUpdate:model-value': (next: unknown) => {
              bound.value = next
            },
          }),
      }),
    ),
  )

  return bound
}

describe('agent observe', () => {
  it('should hear a change inside one element only', async () => {
    const first = mountBound(Input, 'First', '')
    mountBound(Input, 'Second', '')
    const agent = createAgent()
    const heard: AgentChange[] = []
    const entries = agent.snapshot()
    const root = elementOf(find(entries, 'input').ref)!

    stops.push(observe((change) => heard.push(change), { within: root }))

    await agent.act({ steps: [{ ref: 'First', action: 'setValue', args: ['a'] }] })
    await agent.act({ steps: [{ ref: 'Second', action: 'setValue', args: ['b'] }] })

    expect(heard).toHaveLength(1)
    expect(heard[0]).toMatchObject({ label: 'First', key: 'value', value: 'a', previous: '' })
    expect(first.value).toBe('a')
  })

  it('should name the element a ref points at', () => {
    mountBound(Input, 'Project name', '')
    const agent = createAgent()
    const { ref } = find(agent.snapshot(), 'input')

    expect(elementOf(ref)?.querySelector('input')).toBeTruthy()
    expect(elementOf('c999')).toBeUndefined()
  })
})

describe('agent stage', () => {
  it('should put a value on a control and take it back', async () => {
    const value = mountBound(Input, 'Project name', 'before')
    const agent = createAgent()
    const staged = await stageChanges(agent, [{ ref: 'Project name', value: 'after' }])

    expect(value.value).toBe('after')
    expect(staged.applied).toEqual([
      { ref: find(agent.snapshot(), 'input').ref, key: 'value', before: 'before', value: 'after' },
    ])

    expect(await staged.revert()).toEqual([])
    expect(value.value).toBe('before')

    // A stage runs once: a second revert puts nothing back.
    expect(await staged.revert()).toEqual([])
    expect(value.value).toBe('before')
  })

  it('should skip a control that takes no such action', async () => {
    mountBound(Input, 'Project name', '')
    const agent = createAgent()
    const staged = await stageChanges(agent, [{ ref: 'Project name', key: 'missing', value: 'x' }])

    expect(staged.applied).toEqual([])
  })
})

describe('agent history', () => {
  it('should step back and forth over what changed', async () => {
    const value = mountBound(Input, 'Project name', 'start')
    const agent = createAgent()
    const history = createHistory(agent)

    stops.push(history.stop)

    await agent.act({ steps: [{ ref: 'Project name', action: 'setValue', args: ['a'] }] })
    await agent.act({ steps: [{ ref: 'Project name', action: 'setValue', args: ['b'] }] })

    expect(history.entries().map((entry) => entry.value)).toEqual(['a', 'b'])

    expect(await history.undo()).toBe(true)
    expect(value.value).toBe('a')

    expect(await history.undo()).toBe(true)
    expect(value.value).toBe('start')

    expect(await history.undo()).toBe(false)

    expect(await history.redo()).toBe(true)
    expect(value.value).toBe('a')
  })

  it('should drop what was undone once something new changes', async () => {
    mountBound(Input, 'Project name', 'start')
    const agent = createAgent()
    const history = createHistory(agent)

    stops.push(history.stop)

    await agent.act({ steps: [{ ref: 'Project name', action: 'setValue', args: ['a'] }] })
    await agent.act({ steps: [{ ref: 'Project name', action: 'setValue', args: ['b'] }] })
    await history.undo()

    expect(history.canRedo()).toBe(true)

    await agent.act({ steps: [{ ref: 'Project name', action: 'setValue', args: ['c'] }] })

    expect(history.canRedo()).toBe(false)
    expect(history.entries().map((entry) => entry.value)).toEqual(['a', 'c'])
  })

  it('should drop an entry whose component left the page', async () => {
    const bound = ref<unknown>('start')
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Input, {
            modelValue: bound.value,
            'aria-label': 'Project name',
            'onUpdate:model-value': (next: unknown) => {
              bound.value = next
            },
          }),
      }),
    )
    const agent = createAgent()
    const history = createHistory(agent)

    stops.push(history.stop)

    await agent.act({ steps: [{ ref: 'Project name', action: 'setValue', args: ['a'] }] })

    expect(history.entries()).toHaveLength(1)

    wrapper.unmount()

    // The control is gone, so the entry can never be put back: it goes rather than
    // blocking every change behind it.
    expect(await history.undo()).toBe(false)
    expect(history.entries()).toEqual([])
  })

  it('should never put a secret value back', async () => {
    const value = mountBound(Input, 'Password', '', { password: true })
    const agent = createAgent()
    const history = createHistory(agent)

    stops.push(history.stop)

    await agent.act({ steps: [{ ref: 'Password', action: 'setValue', args: ['hunter2'] }] })

    expect(history.entries()).toEqual([])
    expect(await history.undo()).toBe(false)
    expect(value.value).toBe('hunter2')
  })
})
