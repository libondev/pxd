import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, ref } from 'vue'
import { createAgent } from '../../src/agent'
import { inspectAgent } from '../../src/agent/testing'
import Input from '../../src/components/input/index.vue'

const mounted: { unmount: () => void }[] = []

const track = <T extends { unmount: () => void }>(wrapper: T) => {
  mounted.push(wrapper)

  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
})

function mountField(value = '', attrs: Record<string, string> = {}): void {
  const bound = ref(value)

  track(
    mount(
      defineComponent({
        setup: () => () =>
          h(Input, {
            modelValue: bound.value,
            'aria-label': 'Notes',
            'onUpdate:model-value': (next: unknown) => {
              bound.value = String(next)
            },
            ...attrs,
          }),
      }),
    ),
  )
}

describe('agent testing', () => {
  it('should find a component by the name a step would use', () => {
    mountField('Hello')
    const view = inspectAgent()

    expect(view.component('Notes')).toMatchObject({
      component: 'input',
      label: 'Notes',
      value: 'Hello',
      actions: ['setValue', 'focus', 'blur', 'select'],
    })
    expect(view.component('input').label).toBe('Notes')
  })

  it('should match the keys a test names, and say both sides when one differs', () => {
    mountField('Hello')
    const view = inspectAgent()

    view.component('Notes', { value: 'Hello', actions: ['setValue', 'focus', 'blur', 'select'] })

    expect(() => view.component('Notes', { value: 'Goodbye' })).toThrow(
      'input c1 "Notes" does not match:',
    )
    expect(() => view.component('Notes', { value: 'Goodbye' })).toThrow(
      'value: expected "Goodbye", saw "Hello"',
    )
  })

  it('should pass over a key the component does not report', () => {
    mountField()
    const view = inspectAgent()

    view.component('Notes', { required: undefined })

    expect(() => view.component('Notes', { required: true })).toThrow('required: expected true')
  })

  it('should carry the refusal the bridge writes for a name it cannot settle', () => {
    mountField()
    const view = inspectAgent()

    expect(() => view.component('Pricing')).toThrow('No component matches "Pricing"')
  })

  it('should say when a component a test expects to be hidden is there', () => {
    mountField()
    const view = inspectAgent()

    view.absent('checkbox')

    expect(() => view.absent('Notes')).toThrow('Expected no component to answer to "Notes"')
    expect(() => view.absent('input')).toThrow('input c1 "Notes" does')
  })

  it('should run a step and refuse one, with or without the words to expect', async () => {
    mountField()
    const view = inspectAgent()

    const result = await view.run({ ref: 'Notes', action: 'setValue', args: ['Atlas'] })

    expect(result.ok).toBe(true)
    expect(view.component('Notes').value).toBe('Atlas')

    await view.refuse({ ref: 'Notes', action: 'setQuery', args: ['x'] }, 'has no action "setQuery"')
    await view.refuse({ ref: 'Notes', action: 'setQuery', args: ['x'] }, /has no action/)
  })

  it('should fail a run with the step that stopped it', async () => {
    mountField()
    const view = inspectAgent()

    await expect(
      view.run([
        { ref: 'Notes', action: 'setValue', args: ['Atlas'] },
        { ref: 'Notes', action: 'setQuery', args: ['x'] },
      ]),
    ).rejects.toThrow('Step 2:')
  })

  it('should say when a step a test expected to be refused ran', async () => {
    mountField()
    const view = inspectAgent()

    await expect(
      view.refuse({ ref: 'Notes', action: 'setValue', args: ['Atlas'] }),
    ).rejects.toThrow('Expected setValue on Notes to be refused; it ran.')
  })

  it('should build a bridge from options, and wrap one a test already made', async () => {
    mountField('', { 'data-agent-confirm': 'Changes the notes' })

    await inspectAgent().refuse(
      { ref: 'Notes', action: 'setValue', args: ['x'] },
      'Needs a person: Changes the notes',
    )

    await inspectAgent({ allow: () => true }).run({
      ref: 'Notes',
      action: 'setValue',
      args: ['x'],
    })

    const agent = createAgent()

    expect(inspectAgent(agent).agent).toBe(agent)
  })
})
