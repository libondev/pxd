import type { ChangeDetails } from '../../src/types/shared/change'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, nextTick, ref } from 'vue'
import { createAgent } from '../../src/agent'
import Carousel from '../../src/components/carousel/index.vue'
import Checkbox from '../../src/components/checkbox/index.vue'
import ColorSelector from '../../src/components/color-selector/index.vue'
import CommandMenu from '../../src/components/command-menu/index.vue'
import Input from '../../src/components/input/index.vue'
import Modal from '../../src/components/modal/index.vue'
import Radio from '../../src/components/radio/index.vue'
import Select from '../../src/components/select/index.vue'
import Tabs from '../../src/components/tabs/index.vue'
import Toggle from '../../src/components/toggle/index.vue'

const detailsOf = (wrapper: { emitted: (event: string) => unknown[][] | undefined }) =>
  wrapper.emitted('change')?.at(-1)?.[1] as ChangeDetails | undefined

// The registry is module-level, so a component left mounted answers to the same name in the
// next case and act() refuses to guess between two.
const mounted: { unmount: () => void }[] = []

const track = <T extends { unmount: () => void }>(wrapper: T) => {
  mounted.push(wrapper)

  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
})

const field = (value: { value: string }, label = 'Project name') =>
  track(
    mount(
      defineComponent({
        setup: () => () =>
          h(Input, {
            modelValue: value.value,
            'aria-label': label,
            'onUpdate:model-value': (next: unknown) => {
              value.value = next == null ? '' : String(next as string | number)
            },
          }),
      }),
    ),
  )

const toggle = (checked: { value: boolean }) =>
  track(
    mount(
      defineComponent({
        setup: () => () =>
          h(Toggle, {
            modelValue: checked.value,
            'aria-label': 'Notifications',
            'onUpdate:model-value': (next: unknown) => {
              checked.value = next === true
            },
          }),
      }),
    ),
  )

describe('change source', () => {
  it('should name a person who typed in a field', () => {
    const wrapper = field(ref(''))
    const input = wrapper.find('input')

    input.element.value = 'Atlas'
    input.element.dispatchEvent(new Event('change'))

    expect(detailsOf(wrapper.findComponent(Input))).toMatchObject({
      source: 'user',
      reason: 'typed',
    })
  })

  it('should name a person who cleared a field, even without an event', () => {
    const wrapper = track(mount(Input, { props: { modelValue: 'Atlas' } }))

    ;(wrapper.vm as unknown as { clear: () => void }).clear()

    expect(detailsOf(wrapper)).toMatchObject({ source: 'user', reason: 'cleared' })
  })

  it('should name an agent step that set a field', async () => {
    const wrapper = field(ref(''))

    await createAgent().act({
      steps: [{ ref: 'Project name', action: 'setValue', args: ['Atlas'] }],
    })

    expect(detailsOf(wrapper.findComponent(Input))).toMatchObject({
      source: 'agent',
      reason: 'api',
    })
  })

  it('should name a person who pressed a toggle', async () => {
    const wrapper = toggle(ref(false))

    await wrapper.find('input').setValue(true)

    expect(detailsOf(wrapper.findComponent(Toggle))).toMatchObject({
      source: 'user',
      reason: 'trigger-press',
    })
  })

  it('should name a person who ticked a checkbox', async () => {
    const wrapper = track(mount(Checkbox, { props: { modelValue: false } }))

    await wrapper.find('input').setValue(true)

    expect(detailsOf(wrapper)).toMatchObject({ source: 'user', reason: 'item-press' })
  })

  it('should name a person who picked a radio', async () => {
    const wrapper = track(mount(Radio, { props: { modelValue: 'a', value: 'b' } }))

    await wrapper.find('input').setValue(true)

    expect(detailsOf(wrapper)).toMatchObject({ source: 'user', reason: 'item-press' })
  })

  it('should name a person who picked a colour', async () => {
    const wrapper = track(
      mount(ColorSelector, { props: { modelValue: '', colors: ['#000000', '#ff0000'] } }),
    )

    await wrapper.find('input').setValue(true)

    expect(detailsOf(wrapper)).toMatchObject({ source: 'user', reason: 'item-press' })
  })

  it('should name a person who picked a tab', async () => {
    const wrapper = track(
      mount(Tabs, {
        props: {
          modelValue: 'one',
          options: [
            { label: 'One', value: 'one' },
            { label: 'Two', value: 'two' },
          ],
        },
      }),
    )

    await wrapper.findAll('[role="tab"]')[1].trigger('click')

    expect(detailsOf(wrapper)).toMatchObject({ source: 'user', reason: 'item-press' })
  })

  it('should name the close button as the reason a dialog closed', async () => {
    const open = ref(true)
    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(Modal, {
              modelValue: open.value,
              title: 'Settings',
              closeable: true,
              'onUpdate:model-value': (next: unknown) => {
                open.value = Boolean(next)
              },
            }),
        }),
      ),
    )
    // The dialog renders through a teleport, so its buttons live in the document rather than
    // under the wrapper's element.
    await nextTick()
    const close = [...document.querySelectorAll('button')].find((button) =>
      /close/i.test(button.getAttribute('aria-label') ?? ''),
    )

    close!.click()
    await nextTick()

    expect(detailsOf(wrapper.findComponent(Modal))).toMatchObject({
      source: 'user',
      reason: 'close-press',
    })
    expect(open.value).toBe(false)
  })

  it('should name Escape as the reason a dialog closed', async () => {
    const open = ref(true)
    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(Modal, {
              modelValue: open.value,
              title: 'Settings',
              'onUpdate:model-value': (next: unknown) => {
                open.value = Boolean(next)
              },
            }),
        }),
      ),
    )

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(detailsOf(wrapper.findComponent(Modal))).toMatchObject({
      source: 'user',
      reason: 'escape-key',
    })
  })

  it('should tell the caller why a command menu closed', async () => {
    const open = ref(true)
    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(CommandMenu, {
              modelValue: open.value,
              options: [{ label: 'Edit', value: 'edit' }],
              'onUpdate:model-value': (next: unknown) => {
                open.value = Boolean(next)
              },
            }),
        }),
      ),
    )

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.findComponent(CommandMenu).emitted('close')?.at(-1)?.[0]).toBe('escape-key')
  })

  it('should name a person who pressed the carousel arrow', async () => {
    const wrapper = track(
      mount(Carousel, {
        props: {
          autoplay: false,
          options: [{ label: 'One' }, { label: 'Two' }, { label: 'Three' }],
        },
      }),
    )

    await wrapper.find('.pxd-carousel--next-btn').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(detailsOf(wrapper)).toMatchObject({ source: 'user', reason: 'item-press' })
  })

  it('should name an agent step that set multiple select values', async () => {
    const value = ref<(string | number)[]>([])
    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(Select, {
              modelValue: value.value,
              multiple: true,
              options: [
                { label: 'One', value: 1 },
                { label: 'Two', value: 2 },
              ],
              'onUpdate:model-value': (next: unknown) => {
                value.value = next as (string | number)[]
              },
            }),
        }),
      ),
    )
    const agent = createAgent()
    const entry = agent.snapshot().find((component) => component.component === 'select')!

    const result = await agent.act({
      steps: [{ ref: entry.ref, action: 'setValue', args: [[1, 2]] }],
    })

    expect(result.ok).toBe(true)
    expect(detailsOf(wrapper.findComponent(Select))).toMatchObject({ source: 'agent' })
  })

  it('should name an agent step that advanced a carousel', async () => {
    const wrapper = track(
      mount(Carousel, {
        props: {
          autoplay: false,
          options: [{ label: 'One' }, { label: 'Two' }, { label: 'Three' }],
        },
      }),
    )
    const agent = createAgent()
    const entry = agent.snapshot().find((component) => component.component === 'carousel')!

    const result = await agent.act({ steps: [{ ref: entry.ref, action: 'next' }] })

    expect(result.ok).toBe(true)
    expect(detailsOf(wrapper)).toMatchObject({ source: 'agent', reason: 'api' })
  })

  it('should name an agent step that flipped a toggle', async () => {
    const wrapper = toggle(ref(false))

    await createAgent().act({
      steps: [{ ref: 'Notifications', action: 'setValue', args: [true] }],
    })

    expect(detailsOf(wrapper.findComponent(Toggle))).toMatchObject({
      source: 'agent',
      reason: 'api',
    })
  })
})
