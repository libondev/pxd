import type { Component } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, ref } from 'vue'
import { createAgent } from '../../src/agent'
import Button from '../../src/components/button/index.vue'
import CheckboxGroup from '../../src/components/checkbox-group/index.vue'
import Choicebox from '../../src/components/choicebox/index.vue'
import ColorSelector from '../../src/components/color-selector/index.vue'
import CommandMenu from '../../src/components/command-menu/index.vue'
import DatePicker from '../../src/components/date-picker/index.vue'
import List from '../../src/components/list/index.vue'
import Menu from '../../src/components/menu/index.vue'
import Modal from '../../src/components/modal/index.vue'
import MoreButton from '../../src/components/more-button/index.vue'
import NumberInput from '../../src/components/number-input/index.vue'
import PinInput from '../../src/components/pin-input/index.vue'
import RadioGroup from '../../src/components/radio-group/index.vue'
import Rating from '../../src/components/rating/index.vue'
import Select from '../../src/components/select/index.vue'
import Slider from '../../src/components/slider/index.vue'
import Steps from '../../src/components/steps/index.vue'
import Switch from '../../src/components/switch/index.vue'
import Textarea from '../../src/components/textarea/index.vue'
import TimePicker from '../../src/components/time-picker/index.vue'

const mounted: { unmount: () => void }[] = []

function track<T extends { unmount: () => void }>(wrapper: T) {
  mounted.push(wrapper)

  return wrapper
}

const find = <T extends { component: string }>(entries: T[], component: string) =>
  entries.find((entry) => entry.component === component)!

function mountBound(component: Component, props: Record<string, unknown>, initial: unknown) {
  const bound = ref(initial)
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

  it('should pick a value in a select', async () => {
    const options = [
      { label: 'One', value: 1 },
      { label: 'Two', value: 2 },
    ]
    track(mount(Select, { props: { options }, attrs: { 'aria-label': 'Region' } }))
    const agent = createAgent()

    expect(find(agent.snapshot(), 'select')).toMatchObject({
      label: 'Region',
      value: null,
      open: false,
      actions: ['setValue', 'setOpen', 'toggle'],
    })

    const result = await agent.act({ steps: [{ ref: 'Region', action: 'setValue', args: [2] }] })

    expect(result.ok).toBe(true)
    expect(find(agent.snapshot(), 'select')).toMatchObject({ value: 2, open: false })
  })

  it('should set a date', async () => {
    const bound = mountBound(DatePicker, { 'aria-label': 'Due' }, '')
    const agent = createAgent()

    const entry = find(agent.snapshot(), 'date-picker')

    expect(entry).toMatchObject({ label: 'Due', open: false })

    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'setValue', args: ['2024-08-20'] }],
    })

    expect(result.ok).toBe(true)
    expect(String(bound.value)).toContain('2024')
  })

  it('should open a command menu and filter it', async () => {
    const bound = mountBound(
      CommandMenu,
      {
        options: [
          { label: 'Edit', value: 'edit' },
          { label: 'Delete', value: 'delete' },
        ],
      },
      false,
    )
    const agent = createAgent()

    const closed = find(agent.snapshot(), 'command-menu')

    expect(closed).toMatchObject({ open: false, actions: ['setOpen', 'setQuery'] })

    const opened = await agent.act({
      steps: [{ ref: closed.ref, action: 'setOpen', args: [true] }],
    })

    expect(opened.ok).toBe(true)
    expect(bound.value).toBe(true)

    const filtered = await agent.act({
      steps: [{ ref: closed.ref, action: 'setQuery', args: ['edi'] }],
    })

    expect(filtered.ok).toBe(true)
    expect(find(agent.snapshot(), 'command-menu')).toMatchObject({ open: true, query: 'edi' })
  })

  it('should pick an option in a list', async () => {
    const bound = mountBound(
      List,
      {
        'aria-label': 'Members',
        options: [
          { label: 'Ada', value: 1 },
          { label: 'Bo', value: 2 },
        ],
      },
      null,
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'list')).toMatchObject({
      label: 'Members',
      value: null,
      actions: ['setValue', 'focus', 'dispatch'],
    })

    const result = await agent.act({ steps: [{ ref: 'Members', action: 'setValue', args: [2] }] })

    expect(result.ok).toBe(true)
    expect(bound.value).toBe(2)
  })

  it('should pick an option in a menu', async () => {
    const bound = mountBound(
      Menu,
      {
        'aria-label': 'Actions',
        options: [
          { label: 'Edit', value: 'edit' },
          { label: 'Delete', value: 'delete' },
        ],
      },
      null,
    )
    const agent = createAgent()

    const entry = find(agent.snapshot(), 'menu')

    expect(entry).toMatchObject({ label: 'Actions', value: null, open: false })

    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'setValue', args: ['delete'] }],
    })

    expect(result.ok).toBe(true)
    expect(bound.value).toBe('delete')
  })

  it('should clamp a rating to its count', async () => {
    const bound = mountBound(Rating, { count: 5, 'aria-label': 'Score' }, 0)
    const agent = createAgent()

    expect(find(agent.snapshot(), 'rating')).toMatchObject({
      label: 'Score',
      value: 0,
      count: 5,
      actions: ['setValue'],
    })

    const result = await agent.act({ steps: [{ ref: 'Score', action: 'setValue', args: [9] }] })

    expect(result.ok).toBe(true)
    expect(bound.value).toBe(5)
  })

  it('should move a clickable stepper', async () => {
    const bound = mountBound(
      Steps,
      {
        clickable: true,
        options: [{ title: 'One' }, { title: 'Two' }],
        'aria-label': 'Progress',
      },
      0,
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'steps')).toMatchObject({ label: 'Progress', value: 0 })

    const result = await agent.act({ steps: [{ ref: 'Progress', action: 'setValue', args: [1] }] })

    expect(result.ok).toBe(true)
    expect(bound.value).toBe(1)
  })

  it('should fill a pin input', async () => {
    const bound = mountBound(PinInput, { 'aria-label': 'Code' }, '')
    const agent = createAgent()

    expect(find(agent.snapshot(), 'pin-input')).toMatchObject({
      label: 'Code',
      value: '',
      length: 4,
      actions: ['setValue'],
    })

    const result = await agent.act({ steps: [{ ref: 'Code', action: 'setValue', args: ['1234'] }] })

    expect(result.ok).toBe(true)
    expect(bound.value).toBe('1234')
  })

  it('should pick a colour', async () => {
    const bound = mountBound(
      ColorSelector,
      { colors: ['#000000', '#ff0000'], 'aria-label': 'Tint' },
      '',
    )
    const agent = createAgent()

    const result = await agent.act({
      steps: [{ ref: 'Tint', action: 'setValue', args: ['#ff0000'] }],
    })

    expect(result.ok).toBe(true)
    expect(bound.value).toBe('#ff0000')
  })

  it('should set a time', async () => {
    const bound = mountBound(TimePicker, { 'aria-label': 'Starts' }, '')
    const agent = createAgent()

    const result = await agent.act({
      steps: [{ ref: 'Starts', action: 'setValue', args: ['12:30:00'] }],
    })

    expect(result.ok).toBe(true)
    expect(bound.value).toBe('12:30:00')
  })

  it('should pick a value in a choicebox', async () => {
    const bound = mountBound(
      Choicebox,
      {
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
        'aria-label': 'Pick',
      },
      '',
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'choicebox')).toMatchObject({
      label: 'Pick',
      value: '',
      actions: ['setValue'],
    })

    const result = await agent.act({ steps: [{ ref: 'Pick', action: 'setValue', args: ['b'] }] })

    expect(result.ok).toBe(true)
    expect(bound.value).toBe('b')
  })

  it('should pick an option in a radio group', async () => {
    const value = ref<string | number>('')
    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(RadioGroup, {
              modelValue: value.value,
              'aria-label': 'Size',
              options: [
                { label: 'Small', value: 'sm' },
                { label: 'Large', value: 'lg' },
              ],
              'onUpdate:model-value': (next: unknown) => {
                value.value = next as string
              },
            }),
        }),
      ),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'radio-group')).toMatchObject({
      label: 'Size',
      value: '',
      actions: ['setValue'],
    })

    const result = await agent.act({ steps: [{ ref: 'Size', action: 'setValue', args: ['lg'] }] })

    expect(result.ok).toBe(true)
    expect(value.value).toBe('lg')

    const change = wrapper.findComponent(RadioGroup).emitted('change')?.[0]

    expect(change?.[0]).toBe('lg')
    expect(change?.[1]).toMatchObject({ source: 'agent' })
  })

  it('should set a list of values in a checkbox group', async () => {
    const value = ref<(string | number | boolean)[]>([])
    track(
      mount(
        defineComponent({
          setup: () => () =>
            h(CheckboxGroup, {
              modelValue: value.value,
              'aria-label': 'Toppings',
              options: [
                { label: 'Cheese', value: 'cheese' },
                { label: 'Ham', value: 'ham' },
              ],
              'onUpdate:model-value': (next: unknown) => {
                value.value = next as (string | number | boolean)[]
              },
            }),
        }),
      ),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'checkbox-group')).toMatchObject({
      label: 'Toppings',
      value: [],
      actions: ['setValue'],
    })

    const result = await agent.act({
      steps: [{ ref: 'Toppings', action: 'setValue', args: [['ham']] }],
    })

    expect(result.ok).toBe(true)
    expect(value.value).toEqual(['ham'])
  })

  it('should pick a value in a switch', async () => {
    const value = ref<string | number>('')
    track(
      mount(
        defineComponent({
          setup: () => () =>
            h(Switch, {
              modelValue: value.value,
              'aria-label': 'Mode',
              options: [
                { label: 'On', value: 'on' },
                { label: 'Off', value: 'off' },
              ],
              'onUpdate:model-value': (next: unknown) => {
                value.value = next as string
              },
            }),
        }),
      ),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'switch')).toMatchObject({
      label: 'Mode',
      value: '',
      actions: ['setValue'],
    })

    const result = await agent.act({ steps: [{ ref: 'Mode', action: 'setValue', args: ['on'] }] })

    expect(result.ok).toBe(true)
    expect(value.value).toBe('on')
  })

  it('should open a closed dialog to press the button inside it', async () => {
    const open = ref(false)
    const removed = ref(false)
    track(
      mount(
        defineComponent({
          setup: () => () =>
            h(
              Modal,
              {
                modelValue: open.value,
                title: 'Settings',
                'onUpdate:model-value': (next: unknown) => {
                  open.value = Boolean(next)
                },
              },
              {
                default: () => h('p', 'Body'),
                footer: () =>
                  h(
                    Button,
                    {
                      onClick: () => {
                        removed.value = true
                      },
                    },
                    () => 'Delete',
                  ),
              },
            ),
        }),
      ),
    )
    const agent = createAgent()

    const closed = find(agent.snapshot(), 'modal')

    expect(closed).toMatchObject({ open: false, actions: ['setOpen'] })
    expect(closed.label).toBeUndefined()

    const result = await agent.act({
      steps: [{ ref: closed.ref, action: 'press', args: ['Delete'] }],
    })

    expect(result.ok).toBe(true)
    expect(removed.value).toBe(true)
    expect(find(agent.snapshot(), 'modal')).toMatchObject({ open: true, label: 'Settings' })
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
