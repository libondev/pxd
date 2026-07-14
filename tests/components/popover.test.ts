import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import Popover from '../../src/components/popover/index.vue'
import type { computePosition as computePositionType } from '@floating-ui/dom'

const mocks = vi.hoisted(() => ({
  computePosition: vi.fn<typeof computePositionType>(async () => ({
    x: 0,
    y: 0,
    placement: 'bottom',
    strategy: 'absolute',
    middlewareData: {},
  })),
}))

vi.mock('@floating-ui/dom', () => ({
  arrow: vi.fn(() => ({ name: 'arrow' })),
  autoUpdate: vi.fn(() => vi.fn()),
  computePosition: mocks.computePosition,
  flip: vi.fn(() => ({ name: 'flip' })),
  hide: vi.fn(() => ({ name: 'hide' })),
  shift: vi.fn(() => ({ name: 'shift' })),
}))

async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await new Promise(requestAnimationFrame)
  await new Promise(requestAnimationFrame)
  await Promise.resolve()
}

function getBodyText(selector: string) {
  return Array.from(document.body.querySelectorAll(selector)).at(-1)?.textContent
}

describe('popover', () => {
  afterEach(() => {
    mocks.computePosition.mockClear()
    document.body.innerHTML = ''
  })

  it('renders properly', () => {
    const wrapper = mount(Popover, {
      slots: {
        default: '<button>Trigger</button>',
      },
    })

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default position to bottom', () => {
    const wrapper = mount(Popover, {
      slots: {
        default: '<button>Trigger</button>',
      },
    })

    expect(wrapper.props('position')).toBe('bottom')

    wrapper.unmount()
  })

  it('should accept custom trigger prop', () => {
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: {
        trigger: ['click'],
      },
      slots: {
        default: '<button>Trigger</button>',
      },
    })

    expect(wrapper.props('trigger')).toEqual(['click'])

    wrapper.unmount()
  })

  it('should default showDelay to 0', () => {
    const wrapper = mount(Popover, {
      slots: {
        default: '<button>Trigger</button>',
      },
    })

    expect(wrapper.props('showDelay')).toBe(0)

    wrapper.unmount()
  })

  it('should default closeOnPressEscape to true', () => {
    const wrapper = mount(Popover, {
      slots: {
        default: '<button>Trigger</button>',
      },
    })

    expect(wrapper.props('closeOnPressEscape')).toBe(true)

    wrapper.unmount()
  })

  it('should position click trigger at the clicked point and toggle visibility', async () => {
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: {
        alignPoint: true,
        trigger: 'click',
      },
      slots: {
        default: '<button>Trigger</button>',
        content: '<span>Content</span>',
      },
    })

    const trigger = wrapper.find('.pxd-popover')

    await trigger.trigger('click', { clientX: 120, clientY: 240 })
    await flush()

    const firstReference = mocks.computePosition.mock.calls.at(-1)?.[0]
    expect(firstReference?.getBoundingClientRect()).toMatchObject({
      x: 120,
      y: 240,
    })

    await trigger.trigger('click', { clientX: 160, clientY: 280 })
    await flush()

    expect(wrapper.emitted('hide')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should update the point on every contextmenu and hide on click', async () => {
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: {
        alignPoint: true,
        trigger: 'contextmenu',
      },
      slots: {
        default: '<button>Trigger</button>',
        content: '<span>Content</span>',
      },
    })

    const trigger = wrapper.find('button')

    await trigger.trigger('contextmenu', { clientX: 80, clientY: 100 })
    await flush()
    expect(mocks.computePosition.mock.calls.at(-1)?.[0].getBoundingClientRect()).toMatchObject({
      x: 80,
      y: 100,
    })

    await trigger.trigger('contextmenu', { clientX: 180, clientY: 200 })
    await flush()
    expect(mocks.computePosition.mock.calls.at(-1)?.[0].getBoundingClientRect()).toMatchObject({
      x: 180,
      y: 200,
    })
    expect(wrapper.emitted('show')).toHaveLength(1)

    await trigger.trigger('click')
    await flush()
    expect(wrapper.emitted('hide')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should follow the pointer while hovering with alignPoint', async () => {
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: {
        alignPoint: true,
        trigger: 'hover',
      },
      slots: {
        default: '<button>Trigger</button>',
        content: '<span>Content</span>',
      },
    })

    const trigger = wrapper.find('.pxd-popover')

    await trigger.trigger('pointerenter', { clientX: 20, clientY: 30 })
    await flush()
    await trigger.trigger('pointermove', { clientX: 220, clientY: 330 })
    await flush()

    expect(mocks.computePosition.mock.calls.at(-1)?.[0].getBoundingClientRect()).toMatchObject({
      x: 220,
      y: 330,
    })

    await trigger.trigger('pointerleave')
    await flush()
    expect(wrapper.emitted('hide')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should not close a hover popover from click or contextmenu', async () => {
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: {
        alignPoint: true,
        trigger: ['hover', 'click', 'contextmenu'],
      },
      slots: {
        default: '<button>Trigger</button>',
        content: '<span>Content</span>',
      },
    })

    const trigger = wrapper.find('button')

    await trigger.trigger('pointerenter', { clientX: 20, clientY: 30 })
    await flush()
    await trigger.trigger('click', { clientX: 40, clientY: 50 })
    await trigger.trigger('contextmenu', { clientX: 60, clientY: 70 })
    await flush()

    expect(mocks.computePosition.mock.calls.at(-1)?.[0].getBoundingClientRect()).toMatchObject({
      x: 60,
      y: 70,
    })
    expect(wrapper.emitted('hide')).toBeUndefined()

    wrapper.unmount()
  })

  it('should update content slot props for matched trigger', async () => {
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: {
        trigger: 'click',
        triggerSelector: '[data-popover-trigger]',
      },
      slots: {
        default: `
          <button data-popover-trigger data-title="First">First</button>
          <button data-popover-trigger data-title="Second">Second</button>
        `,
        content: (params: { activeTrigger: HTMLElement | null; activeTriggerIndex: number }) =>
          h('span', { class: 'content' }, `${params.activeTrigger?.dataset.title}:${params.activeTriggerIndex}`),
      },
    })

    await wrapper.find('[data-title="Second"]').trigger('click')
    await flush()

    expect(getBodyText('.content')).toBe('Second:1')

    wrapper.unmount()
  })

  it('should move between matched triggers without hiding', async () => {
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: {
        trigger: 'click',
        triggerSelector: '[data-popover-trigger]',
      },
      slots: {
        default: `
          <button data-popover-trigger data-title="First">First</button>
          <button data-popover-trigger data-title="Second">Second</button>
        `,
        content: (params: { activeTrigger: HTMLElement | null }) =>
          h('span', { class: 'content' }, params.activeTrigger?.dataset.title),
      },
    })

    const triggers = wrapper.findAll('[data-popover-trigger]')

    await triggers[0].trigger('click')
    await flush()
    await triggers[1].trigger('click')
    await flush()

    expect(wrapper.emitted('show')).toHaveLength(1)
    expect(wrapper.emitted('hide')).toBeUndefined()
    expect(getBodyText('.content')).toBe('Second')
    expect(mocks.computePosition.mock.calls.at(-1)?.[0]).toBe(triggers[1].element)

    wrapper.unmount()
  })

  it('should keep toggle behavior for same matched trigger', async () => {
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: {
        trigger: 'click',
        triggerSelector: '[data-popover-trigger]',
      },
      slots: {
        default: '<button data-popover-trigger>Trigger</button>',
        content: '<span>Content</span>',
      },
    })

    const trigger = wrapper.find('[data-popover-trigger]')

    await trigger.trigger('click')
    await flush()
    await trigger.trigger('click')
    await flush()

    expect(wrapper.emitted('show')).toHaveLength(1)
    expect(wrapper.emitted('hide')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should use first matched trigger when opened by model value', async () => {
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: {
        modelValue: true,
        trigger: 'manual',
        triggerSelector: '[data-popover-trigger]',
      },
      slots: {
        default: `
          <button data-popover-trigger data-title="First">First</button>
          <button data-popover-trigger data-title="Second">Second</button>
        `,
        content: (params: { activeTrigger: HTMLElement | null; activeTriggerIndex: number }) =>
          h('span', { class: 'content' }, `${params.activeTrigger?.dataset.title}:${params.activeTriggerIndex}`),
      },
    })

    await flush()

    const first = wrapper.find('[data-title="First"]')

    expect(getBodyText('.content')).toBe('First:0')
    expect(mocks.computePosition.mock.calls.at(-1)?.[0]).toBe(first.element)

    wrapper.unmount()
  })
})
