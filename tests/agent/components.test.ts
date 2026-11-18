import type { AgentChange } from '../../src/agent'
import type { ListOption } from '../../src/components/list/types'
import type { Component } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, ref } from 'vue'
import { createAgent } from '../../src/agent'
import { inspectAgent } from '../../src/agent/testing'
import ActiveGraph from '../../src/components/active-graph/index.vue'
import ApprovalCard from '../../src/components/approval-card/index.vue'
import Button from '../../src/components/button/index.vue'
import Calendar from '../../src/components/calendar/index.vue'
import Carousel from '../../src/components/carousel/index.vue'
import CheckboxGroup from '../../src/components/checkbox-group/index.vue'
import Checkbox from '../../src/components/checkbox/index.vue'
import Choicebox from '../../src/components/choicebox/index.vue'
import ColorSelector from '../../src/components/color-selector/index.vue'
import CommandMenu from '../../src/components/command-menu/index.vue'
import ContextUsage from '../../src/components/context-usage/index.vue'
import Countdown from '../../src/components/countdown/index.vue'
import DatePicker from '../../src/components/date-picker/index.vue'
import Drawer from '../../src/components/drawer/index.vue'
import EffortSlider from '../../src/components/effort-slider/index.vue'
import Gauge from '../../src/components/gauge/index.vue'
import HoldButton from '../../src/components/hold-button/index.vue'
import ImagePreview from '../../src/components/image-preview/index.vue'
import Input from '../../src/components/input/index.vue'
import List from '../../src/components/list/index.vue'
import Mention from '../../src/components/mention/index.vue'
import Menu from '../../src/components/menu/index.vue'
import Modal from '../../src/components/modal/index.vue'
import MoreButton from '../../src/components/more-button/index.vue'
import NumberInput from '../../src/components/number-input/index.vue'
import PageNumber from '../../src/components/page-number/index.vue'
import PinInput from '../../src/components/pin-input/index.vue'
import Popover from '../../src/components/popover/index.vue'
import Progress from '../../src/components/progress/index.vue'
import RadioGroup from '../../src/components/radio-group/index.vue'
import Radio from '../../src/components/radio/index.vue'
import Rating from '../../src/components/rating/index.vue'
import Reactions from '../../src/components/reactions/index.vue'
import Resizable from '../../src/components/resizable/index.vue'
import ScrollProgress from '../../src/components/scroll-progress/index.vue'
import SearchInput from '../../src/components/search-input/index.vue'
import Select from '../../src/components/select/index.vue'
import Slider from '../../src/components/slider/index.vue'
import SplitButton from '../../src/components/split-button/index.vue'
import Steps from '../../src/components/steps/index.vue'
import StickToBottom from '../../src/components/stick-to-bottom/index.vue'
import SwipeCell from '../../src/components/swipe-cell/index.vue'
import Switch from '../../src/components/switch/index.vue'
import Textarea from '../../src/components/textarea/index.vue'
import TimePicker from '../../src/components/time-picker/index.vue'
import Toc from '../../src/components/toc/index.vue'
import TodoList from '../../src/components/todo-list/index.vue'
import ToggleButtonGroup from '../../src/components/toggle-button-group/index.vue'
import ToggleButton from '../../src/components/toggle-button/index.vue'
import Toggle from '../../src/components/toggle/index.vue'
import Tooltip from '../../src/components/tooltip/index.vue'
import Tour from '../../src/components/tour/index.vue'
import Tree from '../../src/components/tree/index.vue'
import VirtualList from '../../src/components/virtual-list/index.vue'
import { flushPopover } from '../helpers/flush-popover'

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

  it('should report a field as required, and only a required one', () => {
    track(
      mount(Input, { props: { modelValue: '', required: true }, attrs: { 'aria-label': 'Email' } }),
    )
    track(mount(Input, { props: { modelValue: '' }, attrs: { 'aria-label': 'Nickname' } }))
    track(
      mount(Textarea, {
        props: { modelValue: '', required: true },
        attrs: { 'aria-label': 'Notes' },
      }),
    )

    const view = inspectAgent()

    expect(view.components()).toHaveLength(3)
    view.component('Notes', { component: 'textarea', required: true })
    view.component('Email', { component: 'input', required: true })
    view.component('Nickname', { required: undefined })
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
    expect(result.results[0].result).toBe('Show More')
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

  it('should refuse a value a closed select does not offer, and take one by its label', async () => {
    track(
      mount(Select, {
        props: {
          options: [
            { label: 'One', value: 1 },
            { label: 'Two', value: 2 },
          ],
        },
        attrs: { 'aria-label': 'Region' },
      }),
    )
    const agent = createAgent()

    const byName = await agent.act({
      steps: [{ ref: 'Region', action: 'setValue', args: ['Three'] }],
    })

    expect(byName.ok).toBe(false)
    expect(byName.error?.message).toContain('No item "Three"')
    expect(byName.error?.message).toContain('One')

    const byValue = await agent.act({
      steps: [{ ref: 'Region', action: 'setValue', args: [9] }],
    })

    expect(byValue.ok).toBe(false)
    expect(byValue.error?.message).toContain('No item 9')

    const byLabel = await agent.act({
      steps: [{ ref: 'Region', action: 'setValue', args: ['Two'] }],
    })

    expect(byLabel.ok).toBe(true)
    expect(find(agent.snapshot(), 'select')).toMatchObject({ value: 2 })
  })

  it('should leave the choices out when a snapshot asks for fields only', () => {
    track(
      mount(Select, {
        props: {
          options: [
            { label: 'One', value: 1 },
            { label: 'Two', value: 2 },
          ],
        },
        attrs: { 'aria-label': 'Region' },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'select').items).toHaveLength(2)

    const bare = find(agent.snapshot({ items: false }), 'select')

    expect(bare.items).toBeUndefined()
    expect(bare).toMatchObject({
      label: 'Region',
      value: null,
      actions: ['setValue', 'setOpen', 'toggle'],
    })

    // The choices are still one call away, which is what makes leaving them out safe.
    expect(agent.query({ within: 'Region' })[0].items).toHaveLength(2)
  })

  it('should read the choices inside a group', async () => {
    track(
      mount(Select, {
        props: {
          options: [
            { type: 'group', label: 'Grouped', options: [{ label: 'One', value: 1 }] },
            { label: 'Two', value: 2 },
          ],
        },
        attrs: { 'aria-label': 'Region' },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'select').items).toEqual([
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
    ])

    const result = await agent.act({
      steps: [{ ref: 'Region', action: 'setValue', args: ['One'] }],
    })

    expect(result.ok).toBe(true)
    expect(find(agent.snapshot(), 'select')).toMatchObject({ value: 1 })
  })

  it('should flip a toggle', async () => {
    const bound = mountBound(Toggle, { 'aria-label': 'Notifications' }, false)
    const agent = createAgent()

    expect(find(agent.snapshot(), 'toggle')).toMatchObject({
      label: 'Notifications',
      value: false,
      checked: false,
      actions: ['setValue'],
    })

    const result = await agent.act({
      steps: [{ ref: 'Notifications', action: 'setValue', args: [true] }],
    })

    expect(result.ok).toBe(true)
    expect(bound.value).toBe(true)
    expect(find(agent.snapshot(), 'toggle')).toMatchObject({ value: true, checked: true })
  })

  it('should move an effort slider to one of its options', async () => {
    track(
      mount(EffortSlider, {
        props: { options: ['low', 'medium', 'high'] },
        attrs: { 'aria-label': 'Effort' },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'effort-slider')).toMatchObject({
      label: 'Effort',
      value: 'low',
      options: ['low', 'medium', 'high'],
    })

    await agent.act({ steps: [{ ref: 'Effort', action: 'setValue', args: ['high'] }] })

    expect(find(agent.snapshot(), 'effort-slider')).toMatchObject({ value: 'high' })
  })

  it('should resize panels', async () => {
    track(mount(Resizable, { attrs: { 'aria-label': 'Panels' } }))
    const agent = createAgent()

    const result = await agent.act({
      steps: [{ ref: 'Panels', action: 'setValue', args: [[60, 40]] }],
    })

    expect(result.ok).toBe(true)
    expect(find(agent.snapshot(), 'resizable')).toMatchObject({ value: [60, 40] })
  })

  it('should not name a container after a button in its content', () => {
    track(
      mount(Resizable, {
        slots: {
          leading: () => h('div', [h('button', { 'aria-label': 'What this setting means' }, 'i')]),
        },
      }),
    )

    const entry = find(createAgent().snapshot(), 'resizable')

    expect(entry.label).toBeUndefined()
    expect(entry.ref).toMatch(/^c\d+$/)
  })

  it('should leave the buttons in a container to the app', async () => {
    let clicks = 0

    track(
      mount(Resizable, {
        slots: {
          leading: () =>
            h('div', [
              h(
                'button',
                { 'aria-label': 'What this setting means', onClick: () => (clicks += 1) },
                'i',
              ),
            ]),
        },
      }),
    )
    const agent = createAgent()
    const entry = find(agent.snapshot(), 'resizable')

    expect(entry.buttons).toBeUndefined()

    const refused = await agent.act({ steps: [{ ref: entry.ref, action: 'press' }] })

    expect(refused.ok).toBe(false)
    expect(refused.error?.message).toContain('is not pressed by a click')
    expect(clicks).toBe(0)
  })

  it('should report a scroll indicator with nothing to call', () => {
    track(mount(ScrollProgress, { attrs: { 'aria-label': 'Read' } }))
    const agent = createAgent()

    expect(find(agent.snapshot(), 'scroll-progress')).toMatchObject({
      label: 'Read',
      percentage: 0,
      actions: [],
    })
  })

  it('should offer scrollToBottom on a stick-to-bottom container', () => {
    track(
      mount(StickToBottom, {
        attrs: { 'aria-label': 'Thread' },
        slots: { default: 'Messages' },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'stick-to-bottom')).toMatchObject({
      label: 'Thread',
      actions: ['scrollToBottom'],
    })
  })

  it('should move a carousel', async () => {
    track(
      mount(Carousel, {
        props: { options: [{ label: 'One' }, { label: 'Two' }, { label: 'Three' }] },
        attrs: { 'aria-label': 'Slides' },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'carousel')).toMatchObject({
      label: 'Slides',
      index: 0,
      count: 3,
      actions: ['next', 'previous', 'goTo', 'play', 'pause'],
    })

    await agent.act({ steps: [{ ref: 'Slides', action: 'goTo', args: [2] }] })

    expect(find(agent.snapshot(), 'carousel')).toMatchObject({ index: 2 })
  })

  it('should move a tour', async () => {
    track(
      mount(Tour, {
        props: {
          current: 0,
          steps: [{ title: 'One' }, { title: 'Two' }, { title: 'Three' }],
        },
        attrs: { 'aria-label': 'Onboarding' },
      }),
    )
    const agent = createAgent()

    const entry = find(agent.snapshot(), 'tour')

    expect(entry).toMatchObject({
      current: 0,
      total: 3,
      actions: ['next', 'previous', 'goTo', 'close'],
    })

    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'goTo', args: [1] }],
    })

    expect(result.ok).toBe(true)
    expect(find(agent.snapshot(), 'tour')).toMatchObject({ current: 1 })
  })

  it('should expand a tree', async () => {
    track(
      mount(Tree, {
        props: {
          data: [
            { value: 'a', label: 'A', children: [{ value: 'a1', label: 'A1' }] },
            { value: 'b', label: 'B', children: [{ value: 'b1', label: 'B1' }] },
          ],
        },
        attrs: { 'aria-label': 'Files' },
      }),
    )
    const agent = createAgent()

    const before = find(agent.snapshot(), 'tree')

    expect(before).toMatchObject({
      label: 'Files',
      expanded: 0,
      actions: [
        'expandKey',
        'collapseKey',
        'expandAll',
        'collapseAll',
        'setActiveKey',
        'scrollToKey',
        'focus',
      ],
    })

    const result = await agent.act({ steps: [{ ref: 'Files', action: 'expandAll' }] })

    expect(result.ok).toBe(true)
    expect(find(agent.snapshot(), 'tree').expanded).toBeGreaterThan(0)
  })

  it('should report a countdown without a value', async () => {
    track(mount(Countdown, { props: { duration: 60_000 }, attrs: { 'aria-label': 'Left' } }))

    const entry = find(createAgent().snapshot(), 'countdown')

    expect(entry).toMatchObject({ label: 'Left', enabled: false, actions: ['reset'] })
  })

  it('should let a mention editor be filled', async () => {
    track(mount(Mention, { attrs: { 'aria-label': 'Reply' } }))

    const entry = find(createAgent().snapshot(), 'mention')

    expect(entry).toMatchObject({
      label: 'Reply',
      value: '',
      actions: [
        'setValue',
        'insertText',
        'insertMention',
        'replaceQuery',
        'focus',
        'blur',
        'clear',
      ],
    })
  })

  it('should complete a task', async () => {
    track(
      mount(TodoList, {
        props: {
          options: [
            { id: 'a', content: 'Write' },
            { id: 'b', content: 'Ship' },
          ],
        },
        attrs: { 'aria-label': 'Plan' },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'todo-list')).toMatchObject({ label: 'Plan' })

    const result = await agent.act({
      steps: [{ ref: 'Plan', action: 'complete', args: ['a'] }],
    })

    expect(result.ok).toBe(true)
    expect(find(agent.snapshot(), 'todo-list').completed).toBe(1)
  })

  it('should redact a field the app marks secret', async () => {
    track(
      mount(Input, {
        props: { modelValue: 'hunter2' },
        attrs: { 'aria-label': 'Password', 'data-agent-secret': '' },
      }),
    )

    const entry = find(createAgent().snapshot(), 'input')

    expect(entry).toMatchObject({ value: '[redacted]' })
    expect(entry.label).toBeUndefined()
    expect(entry.buttons).toBeUndefined()
    expect(entry.items).toBeUndefined()
  })

  it('should leave out a region the app marks hidden', () => {
    const hidden = track(
      mount(
        defineComponent({
          setup: () => () =>
            h('div', { 'data-agent-hidden': '' }, [
              h(Input, { 'aria-label': 'Recovery codes', modelValue: 'abc' }),
            ]),
        }),
      ),
    )

    track(mount(Input, { attrs: { 'aria-label': 'Visible' } }))

    const labels = createAgent()
      .snapshot()
      .map((entry) => entry.label)

    expect(labels).toContain('Visible')
    expect(labels).not.toContain('Recovery codes')

    hidden.unmount()
  })

  it('should read the description a dialog points at', () => {
    track(
      mount(Modal, {
        props: {
          modelValue: true,
          title: 'Settings',
          subtitle: 'Applies to this project',
          'onUpdate:model-value': () => {},
        },
      }),
    )

    expect(find(createAgent().snapshot(), 'modal')).toMatchObject({
      label: 'Settings',
      text: ['Applies to this project'],
    })
  })

  it('should ask a person before pressing a marked button', async () => {
    const removed = ref(false)
    const open = ref(true)
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
                      'data-agent-confirm': 'Deletes the project',
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

    const entry = find(createAgent().snapshot(), 'modal')

    expect(entry).toBeDefined()

    const refused = await createAgent().act({
      steps: [{ ref: entry.ref, action: 'press', args: ['Delete'] }],
    })

    expect(refused.ok).toBe(false)
    expect(refused.error?.message).toContain('Needs a person')
    expect(removed.value).toBe(false)

    const allowed = await createAgent({ allow: () => true }).act({
      steps: [{ ref: entry.ref, action: 'press', args: ['Delete'] }],
    })

    expect(allowed.ok).toBe(true)
    expect(removed.value).toBe(true)
  })

  it('should pick a value in a split button', async () => {
    const bound = mountBound(
      SplitButton,
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

    const entry = find(agent.snapshot(), 'split-button')

    expect(entry).toMatchObject({ label: 'Actions', value: null, actions: ['setValue'] })

    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'setValue', args: ['delete'] }],
    })

    expect(result.ok).toBe(true)
    expect(bound.value).toBe('delete')
  })

  it('should pick a date in a calendar', async () => {
    const bound = mountBound(Calendar, { 'aria-label': 'Due' }, null)
    const agent = createAgent()

    expect(find(agent.snapshot(), 'calendar')).toMatchObject({
      label: 'Due',
      value: null,
      actions: ['setValue', 'selectToday'],
    })

    const result = await agent.act({
      steps: [{ ref: 'Due', action: 'setValue', args: ['2026-11-20'] }],
    })

    expect(result.ok).toBe(true)
    expect(bound.value).toBe('2026-11-20')
  })

  it('should select a day in an active graph', async () => {
    track(
      mount(ActiveGraph, {
        props: {
          data: [{ date: '2026-11-10', count: 3 }],
          startDate: '2026-11-01',
          endDate: '2026-11-30',
        },
        attrs: { 'aria-label': 'Activity' },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'active-graph')).toMatchObject({
      label: 'Activity',
      selected: '',
      actions: ['setValue'],
    })

    await agent.act({ steps: [{ ref: 'Activity', action: 'setValue', args: ['2026-11-10'] }] })

    expect(find(agent.snapshot(), 'active-graph')).toMatchObject({ selected: '2026-11-10' })
  })

  it('should press a button that stands on its own', async () => {
    const clicks = ref(0)
    track(
      mount(
        defineComponent({
          setup: () => () =>
            h(
              Button,
              {
                onClick: () => {
                  clicks.value += 1
                },
              },
              () => 'Save',
            ),
        }),
      ),
    )
    const agent = createAgent()

    const entry = find(agent.snapshot(), 'button')

    expect(entry).toMatchObject({ label: 'Save', buttons: ['Save'], actions: [] })

    const result = await agent.act({ steps: [{ ref: 'Save', action: 'press' }] })

    expect(result.ok).toBe(true)
    expect(clicks.value).toBe(1)
  })

  it('should approve an approval card', async () => {
    track(
      mount(ApprovalCard, {
        props: { title: 'Run command', command: 'rm -rf dist' },
        attrs: { 'aria-label': 'Approval' },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'approval-card')).toMatchObject({
      label: 'Approval',
      status: 'pending',
      actions: ['approve', 'reject', 'dismiss', 'reset'],
    })

    const result = await agent.act({ steps: [{ ref: 'Approval', action: 'approve' }] })

    expect(result.ok).toBe(true)
    expect(find(agent.snapshot(), 'approval-card')).toMatchObject({ status: 'approved' })
  })

  it('should report an approval card that is busy as pending, and refuse it', async () => {
    track(
      mount(ApprovalCard, {
        props: { title: 'Run command', command: 'rm -rf dist', loading: true },
        attrs: { 'aria-label': 'Approval' },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'approval-card')).toMatchObject({
      pending: true,
      disabled: true,
      actions: [],
    })

    const result = await agent.act({ steps: [{ ref: 'Approval', action: 'approve' }] })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toContain('disabled now')
  })

  it('should tell a subscriber who changed what', async () => {
    const value = ref('')
    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(Input, {
              modelValue: value.value,
              'aria-label': 'Project name',
              'onUpdate:model-value': (next: unknown) => {
                value.value = next == null ? '' : String(next as string | number)
              },
            }),
        }),
      ),
    )
    const agent = createAgent()
    const seen: AgentChange[] = []
    const stop = agent.subscribe((change) => seen.push(change))

    await agent.act({
      steps: [{ ref: 'Project name', action: 'setValue', args: ['Atlas'] }],
    })

    expect(seen).toHaveLength(1)
    expect(seen[0]).toMatchObject({
      component: 'input',
      label: 'Project name',
      value: 'Atlas',
    })
    expect(seen[0].details?.source).toBe('agent')

    const input = wrapper.find('input')

    input.element.value = 'typed'
    input.element.dispatchEvent(new Event('change'))

    expect(seen).toHaveLength(2)
    expect(seen[1]).toMatchObject({ value: 'typed' })
    expect(seen[1].details).toMatchObject({ source: 'user', reason: 'typed' })

    stop()

    await agent.act({
      steps: [{ ref: 'Project name', action: 'setValue', args: ['Later'] }],
    })

    expect(seen).toHaveLength(2)
  })

  it('should stay quiet about a hidden region', async () => {
    const value = ref('')
    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h('div', { 'data-agent-hidden': '' }, [
              h(Input, {
                modelValue: value.value,
                'aria-label': 'Recovery codes',
                'onUpdate:model-value': (next: unknown) => {
                  value.value = next == null ? '' : String(next as string | number)
                },
              }),
            ]),
        }),
      ),
    )
    const agent = createAgent()
    const seen: AgentChange[] = []

    agent.subscribe((change) => seen.push(change))

    const entry = find(agent.snapshot(), 'input')

    expect(entry).toBeUndefined()

    const input = wrapper.find('input')

    input.element.value = 'abc'
    input.element.dispatchEvent(new Event('change'))

    // The change did happen — it just never reaches the bridge.
    expect(wrapper.findComponent(Input).emitted('change')).toHaveLength(1)
    expect(seen).toHaveLength(0)
  })

  it('should open and close a popover', async () => {
    track(
      mount(Popover, {
        attrs: { 'aria-label': 'Details' },
        slots: {
          default: () => h(Button, null, () => 'Details'),
          content: () => h('p', 'Body'),
        },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'popover')).toMatchObject({
      label: 'Details',
      open: false,
      actions: ['setOpen', 'toggle'],
    })

    const opened = await agent.act({
      steps: [{ ref: 'Details', action: 'setOpen', args: [true] }],
    })

    expect(opened.ok).toBe(true)
    expect(find(agent.snapshot(), 'popover')).toMatchObject({ open: true })

    await agent.act({ steps: [{ ref: 'Details', action: 'toggle' }] })

    expect(find(agent.snapshot(), 'popover')).toMatchObject({ open: false })
  })

  it('should keep a tooltip out of the bridge', () => {
    track(
      mount(Tooltip, {
        props: { content: 'Files are saved here' },
        slots: { default: () => h('button', { 'aria-label': 'Files are saved here' }, 'i') },
      }),
    )

    const agent = createAgent()

    expect(agent.snapshot().some((entry) => entry.component === 'popover')).toBe(false)
  })

  it('should report the choices a select offers', async () => {
    track(
      mount(Select, {
        props: {
          options: [
            { label: 'One', value: 1 },
            { label: 'Two', value: 2, disabled: true },
          ],
        },
        attrs: { 'aria-label': 'Region' },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'select')).toMatchObject({
      items: [
        { value: 1, label: 'One' },
        { value: 2, label: 'Two', disabled: true },
      ],
    })

    await agent.act({ steps: [{ ref: 'Region', action: 'setValue', args: [1] }] })

    const [first, second] = find(agent.snapshot(), 'select').items as { selected?: boolean }[]

    expect(first.selected).toBe(true)
    expect(second.selected).toBeUndefined()
  })

  it('should report a flattened tree with what is open', () => {
    track(
      mount(Tree, {
        props: {
          data: [
            { value: 'a', label: 'A', children: [{ value: 'a1', label: 'A1' }] },
            { value: 'b', label: 'B' },
          ],
          expandedKeys: ['a'],
        },
        attrs: { 'aria-label': 'Files' },
      }),
    )

    expect(find(createAgent().snapshot(), 'tree')).toMatchObject({
      items: [
        { value: 'a', label: 'A', expanded: true },
        { value: 'a1', label: 'A1' },
        { value: 'b', label: 'B' },
      ],
    })
  })

  it('should find a component by one of its choices', () => {
    track(
      mount(Menu, {
        props: {
          options: [
            { label: 'Edit', value: 'edit' },
            { label: 'Delete', value: 'delete' },
          ],
        },
        attrs: { 'aria-label': 'Actions' },
      }),
    )
    const agent = createAgent()

    expect(agent.query({ text: 'delete' })).toHaveLength(1)
    expect(agent.query({ text: 'delete' })[0]).toMatchObject({ component: 'menu' })
    expect(agent.query({ text: 'nothing here' })).toHaveLength(0)
  })

  it('should cut a long option list and say how many there are', () => {
    const options = Array.from({ length: 120 }, (_, index) => ({
      label: `Item ${index}`,
      value: index,
    }))

    track(mount(List, { props: { options }, attrs: { 'aria-label': 'Rows' } }))

    const entry = find(createAgent().snapshot(), 'list')

    expect(entry.items).toHaveLength(100)
    expect(entry.itemCount).toBe(120)
  })

  it('should press an icon button by the name it answers to', async () => {
    const clicks = ref(0)
    track(
      mount(
        defineComponent({
          setup: () => () =>
            h(
              Button,
              {
                icon: true,
                'aria-label': 'Clear',
                onClick: () => {
                  clicks.value += 1
                },
              },
              () => h('span', '×'),
            ),
        }),
      ),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'button')).toMatchObject({ label: 'Clear', buttons: ['Clear'] })

    const result = await agent.act({ steps: [{ ref: 'Clear', action: 'press' }] })

    expect(result.ok).toBe(true)
    expect(clicks.value).toBe(1)
  })

  it('should say which step failed', async () => {
    track(mount(Input, { attrs: { 'aria-label': 'Project name' } }))
    const agent = createAgent()

    const result = await agent.act({
      steps: [
        { ref: 'Project name', action: 'setValue', args: ['Atlas'] },
        { ref: 'Project name', action: 'submit' },
      ],
    })

    expect(result.ok).toBe(false)
    expect(result.error).toMatchObject({ ref: find(agent.snapshot(), 'input').ref, step: 1 })
    expect(result.results).toHaveLength(1)
  })

  it('should not run a step it has no time for', async () => {
    track(mount(Input, { attrs: { 'aria-label': 'Project name' } }))
    const agent = createAgent()

    const result = await agent.act({
      steps: [{ ref: 'Project name', action: 'setValue', args: ['Atlas'] }],
      timeout: 0,
    })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toContain('Timed out')
    expect(find(agent.snapshot(), 'input')).toMatchObject({ value: '' })
  })

  it('should not run a step that was canceled', async () => {
    const controller = new AbortController()

    track(mount(Input, { attrs: { 'aria-label': 'Project name' } }))

    controller.abort()

    const result = await createAgent().act({
      steps: [{ ref: 'Project name', action: 'setValue', args: ['Atlas'] }],
      signal: controller.signal,
    })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toBe('Canceled.')
  })

  it('should open a drawer', async () => {
    const open = ref(false)
    track(
      mount(
        defineComponent({
          setup: () => () =>
            h(
              Drawer,
              {
                modelValue: open.value,
                title: 'Filters',
                'onUpdate:model-value': (next: unknown) => {
                  open.value = Boolean(next)
                },
              },
              { default: () => h('p', 'Body') },
            ),
        }),
      ),
    )
    const agent = createAgent()

    const closed = find(agent.snapshot(), 'drawer')

    expect(closed).toMatchObject({ open: false, actions: ['setOpen'] })

    const result = await agent.act({
      steps: [{ ref: closed.ref, action: 'setOpen', args: [true] }],
    })

    expect(result.ok).toBe(true)
    expect(open.value).toBe(true)
    expect(find(agent.snapshot(), 'drawer')).toMatchObject({ open: true, label: 'Filters' })
  })

  it('should pick a reaction', async () => {
    const bound = mountBound(
      Reactions,
      {
        'aria-label': 'Reactions',
        options: ['👍', '🎉'],
      },
      [],
    )
    const agent = createAgent()

    const entry = find(agent.snapshot(), 'reactions')

    expect(entry).toMatchObject({ label: 'Reactions', actions: ['pick', 'toggle'] })

    const result = await agent.act({
      steps: [{ ref: 'Reactions', action: 'pick', args: ['🎉'] }],
    })

    expect(result.ok).toBe(true)
    expect((bound.value as { emoji: string }[]).map((reaction) => reaction.emoji)).toEqual(['🎉'])
  })

  it('should pick a toggle button in a group', async () => {
    const bound = mountBound(
      ToggleButtonGroup,
      {
        'aria-label': 'View',
        options: [
          { label: 'List', value: 'list' },
          { label: 'Grid', value: 'grid' },
        ],
      },
      'list',
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'toggle-button-group')).toMatchObject({
      label: 'View',
      value: 'list',
      items: [
        { label: 'List', value: 'list', selected: true },
        { label: 'Grid', value: 'grid' },
      ],
    })

    const result = await agent.act({
      steps: [{ ref: 'View', action: 'setValue', args: ['grid'] }],
    })

    expect(result.ok).toBe(true)
    expect(bound.value).toBe('grid')
  })

  it('should report an inner change under the wrapper that owns it', async () => {
    const wrapper = track(mount(NumberInput, { attrs: { 'aria-label': 'Count' } }))
    const agent = createAgent()
    const seen: AgentChange[] = []

    agent.subscribe((change) => seen.push(change))

    const input = wrapper.find('input')

    input.element.value = '7'
    input.element.dispatchEvent(new Event('change'))

    expect(seen).toHaveLength(1)
    expect(seen[0]).toMatchObject({ component: 'number-input', label: 'Count' })
  })

  it('should wait a render for a button that arrives late', async () => {
    const open = ref(true)
    const ready = ref(false)
    const removed = ref(false)

    track(
      mount(
        defineComponent({
          setup() {
            setTimeout(() => {
              ready.value = true
            }, 0)

            return () =>
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
                    ready.value
                      ? h(
                          Button,
                          {
                            onClick: () => {
                              removed.value = true
                            },
                          },
                          () => 'Delete',
                        )
                      : null,
                },
              )
          },
        }),
      ),
    )

    const agent = createAgent()
    const entry = find(agent.snapshot(), 'modal')

    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'press', args: ['Delete'] }],
    })

    expect(result.ok).toBe(true)
    expect(result.results[0].result).toBe('Delete')
    expect(removed.value).toBe(true)
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

    expect(closed).toMatchObject({
      open: false,
      actions: ['setOpen', 'setQuery'],
      items: [
        { label: 'Edit', value: 'edit' },
        { label: 'Delete', value: 'delete' },
      ],
    })

    const opened = await agent.act({
      steps: [{ ref: closed.ref, action: 'setOpen', args: [true] }],
    })

    expect(opened.ok).toBe(true)
    expect(bound.value).toBe(true)

    // Once its list is on the page, the list is the one that reports the commands.
    expect(find(agent.snapshot(), 'command-menu').items).toBeUndefined()
    expect(find(agent.snapshot(), 'list')).toMatchObject({
      items: [
        { label: 'Edit', value: 'edit' },
        { label: 'Delete', value: 'delete' },
      ],
    })

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

  it('should ask about a choice that carries its sentence in the option', async () => {
    const bound = mountBound(
      Menu,
      {
        'aria-label': 'Actions',
        options: [
          { label: 'Edit', value: 'edit' },
          { label: 'Delete', value: 'delete', confirm: 'Deletes the project' },
        ],
      },
      null,
    )
    const agent = createAgent()
    const entry = find(agent.snapshot(), 'menu')

    expect(entry.items).toContainEqual({
      label: 'Delete',
      value: 'delete',
      confirm: 'Deletes the project',
    })

    const unmarked = await agent.act({
      steps: [{ ref: 'Actions', action: 'setValue', args: ['edit'] }],
    })

    expect(unmarked.ok).toBe(true)

    const refused = await agent.act({
      steps: [{ ref: 'Actions', action: 'setValue', args: ['delete'] }],
    })

    expect(refused.ok).toBe(false)
    expect(refused.error?.message).toContain('Needs a person: Deletes the project')
    expect(bound.value).toBe('edit')

    const allowed = await createAgent({ allow: () => true }).act({
      steps: [{ ref: 'Actions', action: 'setValue', args: ['delete'] }],
    })

    expect(allowed.ok).toBe(true)
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

  it('should set a list of one when a multiple group takes a single value', async () => {
    const value = ref<(string | number | boolean)[]>([])

    track(
      mount(
        defineComponent({
          setup: () => () =>
            h(CheckboxGroup, {
              modelValue: value.value,
              'aria-label': 'Counts',
              options: [
                { label: 'One', value: 1 },
                { label: 'Two', value: 2 },
              ],
              'onUpdate:model-value': (next: unknown) => {
                value.value = next as (string | number | boolean)[]
              },
            }),
        }),
      ),
    )
    const agent = createAgent()

    const result = await agent.act({ steps: [{ ref: 'Counts', action: 'setValue', args: [2] }] })

    expect(result.ok).toBe(true)
    expect(value.value).toEqual([2])
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

  it('should leave a closed dialog shut, and press inside it once it opens', async () => {
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

    const refused = await agent.act({
      steps: [{ ref: closed.ref, action: 'press', args: ['Delete'] }],
    })

    expect(refused.ok).toBe(false)
    expect(refused.error?.message).toContain('has no buttons to press')
    expect(refused.error?.message).toContain('Open it first with setOpen')
    expect(removed.value).toBe(false)
    expect(find(agent.snapshot(), 'modal')).toMatchObject({ open: false })

    const opened = await agent.act({
      steps: [
        { ref: closed.ref, action: 'setOpen', args: [true] },
        { ref: closed.ref, action: 'press', args: ['Delete'] },
      ],
    })

    expect(opened.ok).toBe(true)
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
    expect(result.error?.message).toContain('Open it first with toggle')
    expect(expanded.value).toBe(false)
  })
})

describe('agent readings and pages', () => {
  it('should report a progress bar with nothing to call', () => {
    track(mount(Progress, { props: { modelValue: 30 }, attrs: { 'aria-label': 'Upload' } }))
    const agent = createAgent()

    expect(find(agent.snapshot(), 'progress')).toMatchObject({
      label: 'Upload',
      value: 30,
      min: 0,
      max: 100,
      percentage: 30,
      actions: [],
    })
  })

  it('should report a gauge as a reading', () => {
    track(mount(Gauge, { props: { modelValue: 45 }, attrs: { 'aria-label': 'CPU' } }))
    const agent = createAgent()

    expect(find(agent.snapshot(), 'gauge')).toMatchObject({
      label: 'CPU',
      value: 45,
      indeterminate: false,
      actions: [],
    })
  })

  it('should report the segments a context meter is made of', () => {
    track(
      mount(ContextUsage, {
        props: {
          total: 200,
          data: [
            { name: 'Code', tokens: 50 },
            { name: 'Docs', tokens: 25 },
          ],
        },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'context-usage')).toMatchObject({
      percentage: 38,
      used: 75,
      total: 200,
      segments: [
        { name: 'Code', tokens: 50, percentage: 25 },
        { name: 'Docs', tokens: 25, percentage: 12.5 },
      ],
      actions: [],
    })
  })

  it('should list the rows a virtual list holds and retry a failed load', async () => {
    const wrapper = track(
      mount(VirtualList, {
        props: {
          items: [{ id: 'a' }, { id: 'b' }],
          status: 'error',
        },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'virtual-list')).toMatchObject({
      count: 2,
      status: 'error',
      items: [{ value: 'a' }, { value: 'b' }],
      actions: ['scrollToIndex', 'scrollToOffset', 'scrollBy', 'retry'],
    })

    const result = await agent.act({
      steps: [{ ref: 'virtual-list', action: 'retry' }],
    })

    expect(result.ok).toBe(true)
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('should count the rows a virtual list holds without listing them all', () => {
    const items = Array.from({ length: 150 }, (_, index) => ({ id: index }))

    track(mount(VirtualList, { props: { items } }))
    const entry = find(createAgent().snapshot(), 'virtual-list')

    expect(entry.items).toHaveLength(100)
    expect(entry.itemCount).toBe(150)
    expect(entry.count).toBe(150)
  })

  it('should scroll a table of contents to an entry by its label', async () => {
    const scrolled: number[] = []
    const source = {
      getOffsetForIndex: () => 0,
      getScrollOffset: () => 0,
      getMaxScrollOffset: () => 100,
      scrollToIndex: (index: number) => {
        scrolled.push(index)
      },
    }

    track(
      mount(Toc, {
        props: {
          data: [
            { id: 'one', label: 'One', level: 2 },
            { id: 'two', label: 'Two', level: 2 },
          ],
          source,
        },
        attrs: { 'aria-label': 'Outline' },
      }),
    )
    const agent = createAgent()
    const entry = find(agent.snapshot(), 'toc')

    expect(entry).toMatchObject({
      label: 'Outline',
      value: 'two',
      items: [
        { label: 'One', value: 'one' },
        { label: 'Two', value: 'two', selected: true },
      ],
    })

    const result = await agent.act({
      steps: [{ ref: 'Outline', action: 'setValue', args: ['One'] }],
    })

    expect(result.ok).toBe(true)
    expect(scrolled).toEqual([0])

    const refused = await agent.act({
      steps: [{ ref: 'Outline', action: 'setValue', args: ['Nope'] }],
    })

    expect(refused.ok).toBe(false)
    expect(refused.error?.message).toContain('No item "Nope"')
  })

  it('should open and shut a swipe cell as a drag would', async () => {
    let clicks = 0

    track(
      mount(SwipeCell, {
        slots: {
          default: 'Row',
          suffix: () => h('button', { onClick: () => (clicks += 1) }, 'Delete'),
        },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'swipe-cell')).toMatchObject({ value: false })
    expect(find(agent.snapshot(), 'swipe-cell').buttons).toBeUndefined()

    const hidden = await agent.act({
      steps: [{ ref: 'swipe-cell', action: 'press', args: ['Delete'] }],
    })

    expect(hidden.ok).toBe(false)
    expect(hidden.error?.message).toContain('has no buttons to press')

    const opened = await agent.act({
      steps: [{ ref: 'swipe-cell', action: 'open', args: ['suffix'] }],
    })

    expect(opened.ok).toBe(true)
    expect(find(agent.snapshot(), 'swipe-cell')).toMatchObject({
      value: 'suffix',
      buttons: ['Delete'],
    })

    const pressed = await agent.act({
      steps: [{ ref: 'swipe-cell', action: 'press', args: ['Delete'] }],
    })

    expect(pressed.ok).toBe(true)
    expect(clicks).toBe(1)

    await agent.act({ steps: [{ ref: 'swipe-cell', action: 'close' }] })

    expect(find(agent.snapshot(), 'swipe-cell')).toMatchObject({ value: false })
    expect(find(agent.snapshot(), 'swipe-cell').buttons).toBeUndefined()

    const refused = await agent.act({
      steps: [{ ref: 'swipe-cell', action: 'open', args: ['middle'] }],
    })

    expect(refused.ok).toBe(false)
    expect(refused.error?.message).toContain('No "middle" actions')
  })

  it('should open an image preview and pick the image it shows', async () => {
    track(
      mount(ImagePreview, {
        props: {
          data: [
            { src: 'a.png', alt: 'Beach' },
            { src: 'b.png', alt: 'Desk' },
          ],
        },
      }),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'image-preview')).toMatchObject({
      open: false,
      value: 0,
      count: 2,
      items: [
        { label: 'Beach', value: 0, selected: true },
        { label: 'Desk', value: 1 },
      ],
      actions: ['setOpen', 'setValue', 'zoomIn', 'zoomOut', 'rotate', 'reset'],
    })

    const opened = await agent.act({
      steps: [{ ref: 'image-preview', action: 'setOpen', args: [true] }],
    })

    expect(opened.ok).toBe(true)
    expect(find(agent.snapshot(), 'image-preview')).toMatchObject({ open: true, label: 'Beach' })

    await agent.act({ steps: [{ ref: 'image-preview', action: 'setValue', args: ['Desk'] }] })

    expect(find(agent.snapshot(), 'image-preview')).toMatchObject({ value: 1, label: 'Desk' })
  })

  it('should take a page number and refuse a page size it does not offer', async () => {
    const bound = mountBound(PageNumber, { total: 100 }, 3)
    const agent = createAgent()

    expect(find(agent.snapshot(), 'page-number')).toMatchObject({
      value: 3,
      pageCount: 10,
      pageSize: 10,
      total: 100,
      actions: ['setValue', 'setPageSize'],
    })

    await agent.act({ steps: [{ ref: 'page-number', action: 'setValue', args: [99] }] })

    expect(bound.value).toBe(10)

    await agent.act({ steps: [{ ref: 'page-number', action: 'setPageSize', args: [25] }] })

    expect(find(agent.snapshot(), 'page-number')).toMatchObject({ pageSize: 25 })

    const refused = await agent.act({
      steps: [{ ref: 'page-number', action: 'setPageSize', args: [7] }],
    })

    expect(refused.ok).toBe(false)
    expect(refused.error?.message).toContain('one of 10, 25, 50, 100')
  })

  it('should drive a toggle button that stands on its own', async () => {
    const bound = mountBound(ToggleButton, { 'aria-label': 'Bold' }, false)
    const agent = createAgent()

    expect(find(agent.snapshot(), 'toggle-button')).toMatchObject({
      label: 'Bold',
      value: false,
      checked: false,
      actions: ['setValue', 'toggle'],
    })

    await agent.act({ steps: [{ ref: 'Bold', action: 'toggle' }] })

    expect(bound.value).toBe(true)
    expect(find(agent.snapshot(), 'toggle-button')).toMatchObject({ checked: true })
  })

  it('should leave the buttons of a toggle button group to the group', () => {
    track(
      mount(ToggleButtonGroup, {
        props: {
          modelValue: 'left',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
          ],
        },
      }),
    )
    const agent = createAgent()
    const names = agent.snapshot().map((entry) => entry.component)

    expect(names).toContain('toggle-button-group')
    expect(names).not.toContain('toggle-button')
  })

  it('should write a search box and submit it', async () => {
    const value = ref('')
    const updates: unknown[] = []
    const searched: string[] = []

    track(
      mount(
        defineComponent({
          setup: () => () =>
            h(SearchInput, {
              modelValue: value.value,
              'aria-label': 'Find',
              'onUpdate:model-value': (next: unknown) => {
                updates.push(next)
                value.value = String(next)
              },
              onSearch: (next: string) => {
                searched.push(next)
              },
            }),
        }),
      ),
    )
    const agent = createAgent()
    const names = agent.snapshot().map((entry) => entry.component)

    expect(names).not.toContain('input')
    expect(find(agent.snapshot(), 'search-input')).toMatchObject({
      label: 'Find',
      value: '',
      loading: false,
      actions: ['setValue', 'search', 'focus', 'blur', 'select'],
    })

    await agent.act({ steps: [{ ref: 'Find', action: 'setValue', args: ['atlas'] }] })

    expect(value.value).toBe('atlas')
    expect(updates).toEqual(['atlas'])
    expect(find(agent.snapshot(), 'search-input')).toMatchObject({ value: 'atlas' })

    await agent.act({ steps: [{ ref: 'Find', action: 'search' }] })

    expect(searched).toEqual(['atlas'])
  })
})
describe('agent parts and marks', () => {
  it('should hold a hold button, and refuse the press a click cannot do', async () => {
    const wrapper = track(
      mount(HoldButton, {
        props: { duration: 20 },
        attrs: { 'aria-label': 'Delete project' },
        slots: { default: 'Delete' },
      }),
    )
    const agent = createAgent()
    const entry = find(agent.snapshot(), 'hold-button')

    expect(entry).toMatchObject({
      label: 'Delete project',
      status: 'idle',
      disabled: false,
      actions: ['hold'],
    })
    expect(entry.buttons).toBeUndefined()
    expect(agent.snapshot().some((component) => component.component === 'button')).toBe(false)

    const pressed = await agent.act({ steps: [{ ref: 'Delete project', action: 'press' }] })

    expect(pressed.ok).toBe(false)
    expect(pressed.error?.message).toContain('is not pressed by a click')
    expect(wrapper.emitted('confirm')).toBeUndefined()

    const held = await agent.act({ steps: [{ ref: 'Delete project', action: 'hold' }] })

    expect(held.ok).toBe(true)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('should ask before a step takes an item whose row carries the mark', async () => {
    const wrapper = track(
      mount(List, {
        props: {
          modelValue: null,
          'aria-label': 'Members',
          options: [
            { label: 'Ada', value: 1 },
            { label: 'Bo', value: 2 },
          ],
        },
        slots: {
          item: ({ item }: { item: ListOption }) =>
            item.value === 2
              ? h('span', { 'data-agent-confirm': 'Removes Bo' }, String(item.label))
              : String(item.label),
        },
      }),
    )
    const agent = createAgent()

    const refused = await agent.act({
      steps: [{ ref: 'Members', action: 'setValue', args: [2] }],
    })

    expect(refused.ok).toBe(false)
    expect(refused.error?.message).toContain('Needs a person: Removes Bo')

    const allowed = await createAgent({ allow: () => true }).act({
      steps: [{ ref: 'Members', action: 'setValue', args: [2] }],
    })

    expect(allowed.ok).toBe(true)
    expect(wrapper.emitted('update:model-value')).toBeTruthy()
  })

  it('should report a select once, with its own list open', async () => {
    mountBound(
      Select,
      { 'aria-label': 'Region', options: [{ label: 'Europe', value: 'eu' }] },
      null,
    )
    const agent = createAgent()

    await agent.act({ steps: [{ ref: 'Region', action: 'setOpen', args: [true] }] })
    await flushPopover()

    const names = agent.snapshot().map((entry) => entry.component)

    expect(document.querySelector('[data-list]')).not.toBeNull()
    expect(names).toContain('select')
    expect(names).not.toContain('list')
    expect(agent.query({ kind: 'list' })).toHaveLength(0)
    expect(agent.query({ within: 'Region' })[0]).toMatchObject({
      items: [{ label: 'Europe', value: 'eu' }],
    })
  })
})

describe('agent groups', () => {
  it('should report a group once when it renders its choices from options', () => {
    track(
      mount(CheckboxGroup, {
        props: {
          modelValue: [],
          'aria-label': 'Toppings',
          options: [
            { label: 'Cheese', value: 'cheese' },
            { label: 'Ham', value: 'ham' },
          ],
        },
      }),
    )
    const names = createAgent()
      .snapshot()
      .map((entry) => entry.component)

    expect(names).toContain('checkbox-group')
    expect(names).not.toContain('checkbox')
  })

  it('should name a group by the element it points at', () => {
    track(
      mount(
        defineComponent({
          setup: () => () =>
            h('div', [
              h('span', { id: 'group-label' }, 'View'),
              h(ToggleButtonGroup, {
                modelValue: 'list',
                options: [{ label: 'List', value: 'list' }],
                'aria-labelledby': 'group-label',
              }),
              h(Choicebox, {
                modelValue: null,
                options: [{ label: 'One', value: 1 }],
                'aria-labelledby': 'group-label',
              }),
            ]),
        }),
        { attachTo: document.body },
      ),
    )
    const agent = createAgent()

    expect(find(agent.snapshot(), 'toggle-button-group')).toMatchObject({ label: 'View' })
    expect(find(agent.snapshot(), 'choicebox')).toMatchObject({ label: 'View' })
  })

  it('should drive a radio a group holds in its slot', async () => {
    const value = ref<string | number>('')

    track(
      mount(
        defineComponent({
          setup: () => () =>
            h(
              RadioGroup,
              {
                modelValue: value.value,
                'aria-label': 'Plan',
                'onUpdate:model-value': (next: unknown) => {
                  value.value = next as string
                },
              },
              {
                default: () => [
                  h(Radio, { label: 'Free', value: 'free', 'aria-label': 'Free' }),
                  h(Radio, { label: 'Pro', value: 'pro', 'aria-label': 'Pro' }),
                ],
              },
            ),
        }),
      ),
    )
    const agent = createAgent()
    const radios = agent.snapshot().filter((entry) => entry.component === 'radio')

    expect(radios.map((entry) => entry.label)).toEqual(['Free', 'Pro'])
    expect(radios[0]).toMatchObject({ checked: false, actions: ['select'] })

    const result = await agent.act({ steps: [{ ref: 'Pro', action: 'select' }] })

    expect(result.ok).toBe(true)
    expect(value.value).toBe('pro')
    expect(find(agent.snapshot(), 'radio')).toMatchObject({ label: 'Free', checked: false })
    expect(agent.snapshot().find((entry) => entry.label === 'Pro')).toMatchObject({ checked: true })
  })

  it('should add and remove a box a group holds in its slot', async () => {
    const value = ref<(string | number | boolean)[]>([])

    track(
      mount(
        defineComponent({
          setup: () => () =>
            h(
              CheckboxGroup,
              {
                modelValue: value.value,
                'aria-label': 'Extras',
                'onUpdate:model-value': (next: unknown) => {
                  value.value = next as (string | number | boolean)[]
                },
              },
              {
                default: () => [
                  h(Checkbox, { label: 'Cheese', value: 'cheese', 'aria-label': 'Cheese' }),
                ],
              },
            ),
        }),
      ),
    )
    const agent = createAgent()

    await agent.act({ steps: [{ ref: 'Cheese', action: 'toggle' }] })

    expect(value.value).toEqual(['cheese'])

    await agent.act({ steps: [{ ref: 'Cheese', action: 'toggle' }] })

    expect(value.value).toEqual([])
  })
})

describe('agent readings', () => {
  it('should ask about a group choice that carries its sentence in the option', async () => {
    const value = ref<string | number>('')

    track(
      mount(
        defineComponent({
          setup: () => () =>
            h(RadioGroup, {
              modelValue: value.value,
              'aria-label': 'Plan',
              options: [
                { label: 'Free', value: 'free' },
                { label: 'Delete', value: 'delete', confirm: 'Deletes the account' },
              ],
              'onUpdate:model-value': (next: unknown) => {
                value.value = next as string
              },
            }),
        }),
      ),
    )
    const agent = createAgent()

    const refused = await agent.act({
      steps: [{ ref: 'Plan', action: 'setValue', args: ['delete'] }],
    })

    expect(refused.ok).toBe(false)
    expect(refused.error?.message).toContain('Needs a person: Deletes the account')
    expect(value.value).toBe('')

    const allowed = await createAgent({ allow: () => true }).act({
      steps: [{ ref: 'Plan', action: 'setValue', args: ['delete'] }],
    })

    expect(allowed.ok).toBe(true)
    expect(value.value).toBe('delete')
  })
})
