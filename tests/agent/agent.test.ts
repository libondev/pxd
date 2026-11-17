import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, ref } from 'vue'
import { createAgent } from '../../src/agent'
import Checkbox from '../../src/components/checkbox/index.vue'
import Input from '../../src/components/input/index.vue'
import Stack from '../../src/components/stack/index.vue'
import Tabs from '../../src/components/tabs/index.vue'

const options = [
  { label: 'One', value: '1' },
  { label: 'Two', value: '2' },
]

const mounted: { unmount: () => void }[] = []

function track<T extends { unmount: () => void }>(wrapper: T) {
  mounted.push(wrapper)

  return wrapper
}

function mountPage() {
  const input = track(mount(Input, { attrs: { 'aria-label': 'Project name' } }))
  const checked = ref(false)
  const checkbox = track(
    mount(
      defineComponent({
        setup: () => () =>
          h(Checkbox, {
            modelValue: checked.value,
            'aria-label': 'Done',
            'onUpdate:model-value': (value: unknown) => {
              checked.value = value === true
            },
          }),
      }),
    ),
  )
  const tabs = track(
    mount(Tabs, { props: { options, defaultValue: '1' }, attrs: { 'aria-label': 'Views' } }),
  )

  return { input, checkbox, tabs, checked }
}

const find = <T extends { component: string }>(entries: T[], component: string) =>
  entries.find((entry) => entry.component === component)!

afterEach(() => {
  for (const wrapper of mounted.splice(0)) {
    wrapper.unmount()
  }
})

describe('agent', () => {
  it('should list a component by its name, state and actions', () => {
    mountPage()
    const agent = createAgent()

    const entries = agent.snapshot()

    expect(entries.map((entry) => entry.component)).toEqual(['input', 'checkbox', 'tabs'])
    expect(find(entries, 'input')).toMatchObject({
      label: 'Project name',
      value: '',
      actions: ['setValue', 'focus', 'blur', 'select'],
    })
    expect(find(entries, 'checkbox')).toMatchObject({
      label: 'Done',
      checked: false,
      actions: ['setValue', 'toggle'],
    })
    expect(find(entries, 'tabs')).toMatchObject({
      label: 'Views',
      value: '1',
      actions: ['setValue'],
    })
  })

  it('should run a step found by its label', async () => {
    const page = mountPage()
    const agent = createAgent()

    const result = await agent.act({ steps: [{ ref: 'Done', action: 'toggle' }] })

    expect(result.ok).toBe(true)
    expect(page.checked.value).toBe(true)

    const change = page.checkbox.findComponent(Checkbox).emitted('change')?.[0]

    expect(change?.[0]).toBe(true)
    expect(change?.[1]).toMatchObject({ source: 'agent', reason: 'api' })
    expect(find(agent.snapshot(), 'checkbox')).toMatchObject({ checked: true })
  })

  it('should run a step found by its ref', async () => {
    mountPage()
    const agent = createAgent()
    const { ref: tabsRef } = find(agent.snapshot(), 'tabs')

    const result = await agent.act({ steps: [{ ref: tabsRef, action: 'setValue', args: ['2'] }] })

    expect(result.ok).toBe(true)
    expect(find(agent.snapshot(), 'tabs')).toMatchObject({ value: '2' })
  })

  it('should refuse a step whose component it cannot find', async () => {
    mountPage()
    const agent = createAgent()

    const result = await agent.act({ steps: [{ ref: 'Missing', action: 'toggle' }] })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toContain('Missing')
  })

  it('should refuse an action the component does not have', async () => {
    mountPage()
    const agent = createAgent()

    const result = await agent.act({ steps: [{ ref: 'Done', action: 'submit' }] })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toContain('submit')
  })

  it('should leave out a component that declares no node', () => {
    mountPage()
    track(mount(Stack, { slots: { default: 'Save' } }))
    const agent = createAgent()

    expect(agent.snapshot().map((entry) => entry.component)).not.toContain('stack')
  })

  it('should find components by text and kind', () => {
    mountPage()
    const agent = createAgent()

    expect(agent.query({ text: 'project' })).toHaveLength(1)
    expect(agent.query({ kind: 'checkbox' })).toHaveLength(1)
    expect(agent.query({ within: 'Views' })).toHaveLength(1)
  })
})
