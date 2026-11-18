import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
import { createAgent, registerTools } from '../../src/agent'
import Input from '../../src/components/input/index.vue'

const mounted: { unmount: () => void }[] = []

const track = <T extends { unmount: () => void }>(wrapper: T) => {
  mounted.push(wrapper)

  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())

  delete (document as { modelContext?: unknown }).modelContext
})

const find = <T extends { component: string }>(entries: T[], component: string) =>
  entries.find((entry) => entry.component === component)

function mountInput(label: string, value = '') {
  return track(mount(Input, { props: { modelValue: value }, attrs: { 'aria-label': label } }))
}

describe('agent lifecycle', () => {
  it('should keep what a component showed after it leaves the page', async () => {
    const field = mountInput('Project name', 'Atlas')
    const agent = createAgent()

    expect(find(agent.snapshot(), 'input')).toMatchObject({ value: 'Atlas' })

    field.unmount()

    const left = agent.snapshot().find((entry) => entry.offPage === true)

    expect(left).toMatchObject({ component: 'input', label: 'Project name', value: 'Atlas' })
  })

  it('should not report what left before the bridge was made', () => {
    mountInput('Old field').unmount()

    expect(
      createAgent()
        .snapshot()
        .some((entry) => entry.offPage === true),
    ).toBe(false)
  })

  it('should give a component that comes back the ref it had', () => {
    const first = createAgent()
    const field = mountInput('Project name')
    const before = find(first.snapshot(), 'input')!.ref

    field.unmount()
    mountInput('Project name')

    expect(find(createAgent().snapshot(), 'input')!.ref).toBe(before)
  })

  it('should warn about a mark it does not read', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    track(
      mount(
        defineComponent({
          setup: () => () =>
            h('div', { 'data-agent-confimed': 'x' }, [
              h(Input, { modelValue: '', 'aria-label': 'Project name' }),
            ]),
        }),
      ),
    )

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('data-agent-confimed'))

    warn.mockRestore()
  })

  it('should say where the app writes a component', () => {
    track(
      mount(
        defineComponent({
          setup: () => () =>
            h('div', { 'data-agent-source': 'src/pages/settings.vue:24' }, [
              h(Input, { modelValue: '', 'aria-label': 'Project name' }),
            ]),
        }),
      ),
    )

    expect(find(createAgent().snapshot(), 'input')?.source).toBe('src/pages/settings.vue:24')
  })
})

describe('agent registerTools', () => {
  it('should register the three tools with what a browser agent needs to know', async () => {
    const tools: { name: string; annotations: Record<string, boolean>; execute: Function }[] = []

    ;(document as { modelContext?: unknown }).modelContext = {
      registerTool: (tool: (typeof tools)[number]) => {
        tools.push(tool)

        return Promise.resolve()
      },
    }
    mountInput('Project name')

    const agent = createAgent()
    const unregister = registerTools(agent, { allow: () => false })

    expect(tools.map((tool) => tool.name)).toEqual(['snapshot', 'act', 'query'])
    expect(tools[0].annotations).toMatchObject({ readOnlyHint: true, consequentialHint: false })
    expect(tools[1].annotations).toMatchObject({ readOnlyHint: false, consequentialHint: true })

    const act = tools.find((tool) => tool.name === 'act')!

    const result = await act.execute({
      steps: [{ ref: 'Project name', action: 'setValue', args: ['Atlas'] }],
    })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toContain("registerTools' allow")

    unregister()
  })

  it('should need an allow of its own', () => {
    expect(() => registerTools(createAgent(), {} as never)).toThrow('allow')
  })

  it('should do nothing where the browser carries no tools', () => {
    delete (document as { modelContext?: unknown }).modelContext
    mountInput('Project name')

    const unregister = registerTools(createAgent(), { allow: () => true })

    expect(() => unregister()).not.toThrow()
  })

  it('should end a step waiting on allow when the browser cancels the call', async () => {
    const tools: { name: string; execute: Function }[] = []

    ;(document as { modelContext?: unknown }).modelContext = {
      registerTool: (tool: (typeof tools)[number]) => {
        tools.push(tool)

        return Promise.resolve()
      },
    }
    mountInput('Project name')

    const agent = createAgent({ allow: () => new Promise<boolean>(() => {}) })
    const unregister = registerTools(agent, { allow: () => true })
    const act = tools.find((tool) => tool.name === 'act')!
    const controller = new AbortController()

    const running = act.execute(
      { steps: [{ ref: 'Project name', action: 'setValue', args: ['Atlas'] }] },
      { signal: controller.signal },
    )

    controller.abort()

    const result = await running

    expect(result.ok).toBe(false)
    expect(result.error?.message).toBe('Canceled.')

    unregister()
  })
})
