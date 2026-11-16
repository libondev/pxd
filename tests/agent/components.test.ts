import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, ref } from 'vue'
import { createAgent } from '../../src/agent'
import MoreButton from '../../src/components/more-button/index.vue'
import NumberInput from '../../src/components/number-input/index.vue'
import Slider from '../../src/components/slider/index.vue'
import Textarea from '../../src/components/textarea/index.vue'

const mounted: { unmount: () => void }[] = []

function track<T extends { unmount: () => void }>(wrapper: T) {
  mounted.push(wrapper)

  return wrapper
}

const find = <T extends { component: string }>(entries: T[], component: string) =>
  entries.find((entry) => entry.component === component)!

afterEach(() => {
  for (const wrapper of mounted.splice(0)) {
    wrapper.unmount()
  }
})

describe('agent components', () => {
  it('should drive a textarea', async () => {
    const value = ref('')
    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(Textarea, {
              modelValue: value.value,
              'aria-label': 'Notes',
              'onUpdate:model-value': (next: unknown) => {
                value.value = next == null ? '' : String(next as string | number)
              },
            }),
        }),
      ),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'textarea')).toMatchObject({
      label: 'Notes',
      value: '',
      actions: ['setValue', 'focus', 'blur'],
    })

    const result = await agent.act({ steps: [{ ref: 'Notes', action: 'setValue', args: ['Hi'] }] })

    expect(result.ok).toBe(true)
    expect(value.value).toBe('Hi')

    const change = wrapper.findComponent(Textarea).emitted('change')?.[0]

    expect(change?.[0]).toBe('Hi')
    expect(change?.[1]).toMatchObject({ source: 'agent' })
  })

  it('should clamp what a slider is set to', async () => {
    track(mount(Slider, { attrs: { 'aria-label': 'Volume' } }))
    const agent = createAgent()

    expect(find(agent.snapshot(), 'slider')).toMatchObject({
      label: 'Volume',
      value: 0,
      min: 0,
      max: 100,
      actions: ['setValue'],
    })

    const result = await agent.act({
      steps: [{ ref: 'Volume', action: 'setValue', args: [150] }],
    })

    expect(result.ok).toBe(true)
    expect(find(agent.snapshot(), 'slider')).toMatchObject({ value: 100 })
  })

  it('should clamp what a number input is set to', async () => {
    track(mount(NumberInput, { props: { min: 0, max: 10 }, attrs: { 'aria-label': 'Count' } }))
    const agent = createAgent()

    expect(find(agent.snapshot(), 'number-input')).toMatchObject({
      label: 'Count',
      value: null,
      min: 0,
      max: 10,
      actions: ['setValue', 'increment', 'decrement'],
    })

    const result = await agent.act({ steps: [{ ref: 'Count', action: 'setValue', args: [99] }] })

    expect(result.ok).toBe(true)
    expect(find(agent.snapshot(), 'number-input')).toMatchObject({ value: 10 })
  })

  it('should press the only button a component shows', async () => {
    const expanded = ref(false)
    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(MoreButton, {
              modelValue: expanded.value,
              'onUpdate:model-value': (next: unknown) => {
                expanded.value = Boolean(next)
              },
            }),
        }),
      ),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'more-button')).toMatchObject({
      label: 'Show More',
      expanded: false,
      buttons: ['Show More'],
      actions: ['setValue', 'toggle'],
    })

    const result = await agent.act({ steps: [{ ref: 'Show More', action: 'press' }] })

    expect(result.ok).toBe(true)
    expect(expanded.value).toBe(true)
    expect(find(agent.snapshot(), 'more-button')).toMatchObject({ expanded: true })

    const change = wrapper.findComponent(MoreButton).emitted('change')?.[0]

    expect(change?.[0]).toBe(true)
    expect(change?.[1]).toMatchObject({ source: 'agent' })
  })

  it('should refuse a press whose button it cannot find', async () => {
    const expanded = ref(false)
    track(
      mount(
        defineComponent({
          setup: () => () =>
            h(MoreButton, {
              modelValue: expanded.value,
              'onUpdate:model-value': (next: unknown) => {
                expanded.value = Boolean(next)
              },
            }),
        }),
      ),
    )
    const agent = createAgent()

    const result = await agent.act({
      steps: [{ ref: 'Show More', action: 'press', args: ['Save'] }],
    })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toContain('no button matching "Save"')
    expect(expanded.value).toBe(false)
  })
})
