import type { computePosition } from '@floating-ui/dom'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, nextTick, ref } from 'vue'
import Tour from '../../src/components/tour/index.vue'

const mocks = vi.hoisted(() => ({
  computePosition: vi.fn<typeof computePosition>(async () => ({
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

// happy-dom resolves no stylesheet, so <html> never reports as scrollable and the
// scroll lock would silently no-op. Patch it to report what a real browser reports.
const nativeGetComputedStyle = window.getComputedStyle.bind(window)

window.getComputedStyle = ((el: Element, pseudo?: string | null) => {
  const style = nativeGetComputedStyle(el, pseudo as string)

  if (el !== document.documentElement) {
    return style
  }

  return new Proxy(style, {
    get(target, prop) {
      if (prop === 'overflowX' || prop === 'overflowY') {
        return 'visible'
      }

      const value = Reflect.get(target, prop)

      return typeof value === 'function' ? value.bind(target) : value
    },
  })
}) as typeof window.getComputedStyle

async function flush() {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  await new Promise(requestAnimationFrame)
  await new Promise(requestAnimationFrame)
  await nextTick()
}

function makeTarget(rect: Partial<DOMRect> = {}) {
  const el = document.createElement('button')

  el.getBoundingClientRect = () =>
    ({
      top: 100,
      left: 200,
      width: 40,
      height: 20,
      right: 240,
      bottom: 120,
      x: 200,
      y: 100,
      ...rect,
      toJSON: () => ({}),
    }) as DOMRect

  document.body.appendChild(el)

  return el
}

function mountTour(options: { visible: boolean; steps?: unknown[] }) {
  const target = makeTarget()

  const Demo = defineComponent({
    components: { Tour },
    setup() {
      return { visible: ref(options.visible), target }
    },
    template: `<Tour
      v-model="visible"
      :steps="steps ?? [{ target: () => target, title: 'One' }, { target: () => target, title: 'Two' }]"
    />`,
    computed: {
      steps() {
        return options.steps
      },
    },
  })

  return mount(Demo, { attachTo: document.body })
}

describe('tour', () => {
  afterEach(() => {
    mocks.computePosition.mockClear()
    document.body.innerHTML = ''
    document.documentElement.className = ''
    document.body.removeAttribute('style')
    document.documentElement.removeAttribute('style')
  })

  it('renders nothing while it is closed', async () => {
    const wrapper = mountTour({ visible: false })
    await flush()

    // POverlay renders its slot outside the backdrop's v-if, so the tour has to
    // guard its own subtree or the dimming mask paints over the page while closed.
    expect(document.querySelector('[data-tour]')).toBeNull()
    expect(document.querySelector('.pxd-tour--mask')).toBeNull()
    expect(document.querySelector('[data-popover]')).toBeNull()
    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(false)

    wrapper.unmount()
  })

  it('locks the page scroll while open and restores it on close', async () => {
    const wrapper = mountTour({ visible: true })
    await flush()

    expect(document.documentElement.classList.contains('scrollbar-disabled')).toBe(true)

    ;(wrapper.vm as unknown as { visible: boolean }).visible = false
    await flush()

    expect(document.documentElement.classList.contains('scrollbar-disabled')).toBe(false)

    wrapper.unmount()
  })

  it('shows the bubble and its controls once open', async () => {
    const wrapper = mountTour({ visible: true })
    await flush()

    const buttons = Array.from(document.querySelectorAll('.pxd-popover--content button'))

    expect(buttons.map((btn) => btn.textContent?.trim())).toStrictEqual(['Skip', 'Next'])

    wrapper.unmount()
  })

  it('anchors the bubble to the highlight frame, not the popover root', async () => {
    const wrapper = mountTour({ visible: true })
    await flush()

    const reference = mocks.computePosition.mock.calls.at(-1)?.[0] as HTMLElement | undefined

    expect(reference?.dataset.tourAnchor).toBe('')

    wrapper.unmount()
  })

  it('matches the highlight frame to the target rect exactly', async () => {
    const target = makeTarget()

    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { visible: ref(true), target }
      },
      template: `<Tour v-model="visible" :steps="[{ target: () => target }]" />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    const mask = document.querySelector('.pxd-tour--mask') as HTMLElement

    expect(mask).not.toBeNull()
    expect(mask.style.top).toBe('100px')
    expect(mask.style.left).toBe('200px')
    expect(mask.style.width).toBe('40px')
    expect(mask.style.height).toBe('20px')

    wrapper.unmount()
  })

  it('inherits the target border-radius when none is configured', async () => {
    const target = makeTarget()
    target.style.borderRadius = '12px'

    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { visible: ref(true), target }
      },
      template: `<Tour v-model="visible" :steps="[{ target: () => target }]" />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    const mask = document.querySelector('.pxd-tour--mask') as HTMLElement

    expect(mask.style.borderRadius).toBe('12px')

    wrapper.unmount()
  })

  it('falls back to square corners when there is no target', async () => {
    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { visible: ref(true) }
      },
      template: `<Tour v-model="visible" :steps="[{ title: 'Intro' }]" />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    const mask = document.querySelector('.pxd-tour--mask') as HTMLElement

    expect(mask.style.borderRadius).toBe('0px')

    wrapper.unmount()
  })

  it('never makes the target interactive during the tour', async () => {
    const target = makeTarget()

    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { visible: ref(true), target }
      },
      template: `<Tour v-model="visible" :steps="[{ target: () => target }]" />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    // The tour blocks interaction with the page for its whole lifetime.
    expect(target.getAttribute('style')).toBeNull()
    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(true)

    wrapper.unmount()
  })

  it('absorbs pointer input on the page while it is open', async () => {
    const wrapper = mountTour({ visible: true })
    await flush()

    // With no backdrop rendered, the root is the layer that swallows page clicks and,
    // through select-none, stops text selection from starting on the dimmed content.
    const tourRoot = document.querySelector('[data-tour]') as HTMLElement

    expect(tourRoot.className).toContain('pointer-events-auto')
    expect(tourRoot.className).toContain('select-none')

    wrapper.unmount()
  })

  it('emits error and advances when a target is missing', async () => {
    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { visible: ref(true) }
      },
      template: `<Tour
        v-model="visible"
        :steps="[
          { target: '#missing', title: 'One' },
          { title: 'Two' },
        ]"
      />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    expect(wrapper.findComponent(Tour).emitted('error')).toHaveLength(1)

    wrapper.unmount()
  })

  it('awaits beforeEnter before resolving the target', async () => {
    const order: string[] = []
    const target = makeTarget()

    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { visible: ref(true), target, order }
      },
      template: `<Tour
        v-model="visible"
        :steps="[{
          target: () => { order.push('target'); return target },
          beforeEnter: async () => { order.push('beforeEnter') },
        }]"
      />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    expect(order).toStrictEqual(['beforeEnter', 'target'])

    wrapper.unmount()
  })

  it('places the bubble using the step position', async () => {
    const target = makeTarget()

    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { visible: ref(true), target }
      },
      template: `<Tour v-model="visible" :steps="[{ target: () => target, position: 'right' }]" />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    const [, , options] = mocks.computePosition.mock.calls.at(-1)!
    const placement = (options as { placement?: string } | undefined)?.placement

    expect(placement).toBe('right')

    wrapper.unmount()
  })

  it('keeps the bubble interactive while the overlay inerts the page', async () => {
    const wrapper = mountTour({ visible: true })
    await flush()

    // useOverlayManager inerts <html>; the root re-enables input for the tour layer
    // itself, and the bubble opts back in so its controls stay operable.
    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(true)

    const bubble = document.querySelector('.pxd-tour--popover') as HTMLElement

    expect(bubble.className).toContain('pointer-events-auto')

    wrapper.unmount()
  })

  it('emits finish when the last step is completed', async () => {
    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { visible: ref(true) }
      },
      template: `<Tour v-model="visible" :steps="[{ title: 'Only' }]" />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    const tour = wrapper.findComponent(Tour)
    const done = Array.from(document.querySelectorAll('button')).find(
      (btn) => btn.textContent?.trim() === 'Done',
    )

    expect(done).toBeDefined()
    done!.click()
    await flush()

    expect(tour.emitted('finish')).toHaveLength(1)
    expect((wrapper.vm as unknown as { visible: boolean }).visible).toBe(false)

    wrapper.unmount()
  })
})

describe('tour step handling fixes', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.documentElement.className = ''
    document.body.removeAttribute('style')
    document.documentElement.removeAttribute('style')
  })

  it('advances without an external v-model:current binding', async () => {
    const target = makeTarget()

    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { visible: ref(true), target }
      },
      template: `<Tour
        v-model="visible"
        :steps="[
          { target: () => target, title: 'One' },
          { target: () => target, title: 'Two' },
        ]"
      />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    const next = Array.from(document.querySelectorAll('button')).find(
      (btn) => btn.textContent?.trim() === 'Next',
    )

    next!.click()
    await flush()

    const tour = wrapper.findComponent(Tour)
    const content = document.querySelector('.pxd-tour--content') as HTMLElement

    expect(tour.emitted('update:current')).toStrictEqual([[1]])
    expect(content.textContent).toContain('Two')
    expect(content.textContent).toContain('2/2')

    wrapper.unmount()
  })

  it('ignores modified or composing arrow keys', async () => {
    const target = makeTarget()

    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { current: ref(0), target, visible: ref(true) }
      },
      template: `<Tour
        v-model="visible"
        v-model:current="current"
        :steps="[
          { target: () => target, title: 'One' },
          { target: () => target, title: 'Two' },
        ]"
      />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true }))
    await flush()

    const composing = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true })
    Object.assign(composing, { isComposing: true })
    window.dispatchEvent(composing)
    await flush()

    expect((wrapper.vm as unknown as { current: number }).current).toBe(0)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await flush()

    expect((wrapper.vm as unknown as { current: number }).current).toBe(1)

    wrapper.unmount()
  })

  it('emits error and continues when a target resolver throws', async () => {
    const target = makeTarget()

    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return {
          visible: ref(true),
          target,
          broken: () => {
            throw new Error('target exploded')
          },
        }
      },
      template: `<Tour
        v-model="visible"
        :steps="[
          { target: broken, title: 'Broken' },
          { target: () => target, title: 'Two' },
        ]"
      />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    const tour = wrapper.findComponent(Tour)
    const content = document.querySelector('.pxd-tour--content') as HTMLElement

    expect(tour.emitted('error')).toHaveLength(1)
    expect(content.textContent).toContain('Two')

    wrapper.unmount()
  })

  it('emits error and continues when beforeEnter rejects', async () => {
    const target = makeTarget()

    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return {
          visible: ref(true),
          target,
          fail: () => Promise.reject(new Error('before enter failed')),
        }
      },
      template: `<Tour
        v-model="visible"
        :steps="[
          { target: () => target, title: 'One', beforeEnter: fail },
          { target: () => target, title: 'Two' },
        ]"
      />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    const tour = wrapper.findComponent(Tour)
    const content = document.querySelector('.pxd-tour--content') as HTMLElement

    expect(tour.emitted('error')).toHaveLength(1)
    expect(content.textContent).toContain('Two')

    wrapper.unmount()
  })

  it('cancels a pending beforeEnter when the tour closes', async () => {
    const target = makeTarget()
    const scrollIntoView = vi.fn()

    target.scrollIntoView = scrollIntoView

    let resolveBeforeEnter!: () => void

    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return {
          visible: ref(true),
          target,
          beforeEnter: () =>
            new Promise<void>((resolve) => {
              resolveBeforeEnter = resolve
            }),
        }
      },
      template: `<Tour
        v-model="visible"
        :steps="[{ target: () => target, title: 'One', beforeEnter }]"
      />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    ;(wrapper.vm as unknown as { visible: boolean }).visible = false
    await flush()

    resolveBeforeEnter()
    await flush()

    expect(scrollIntoView).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('centers the anchor when a step has no target', async () => {
    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { visible: ref(true) }
      },
      template: `<Tour v-model="visible" :steps="[{ title: 'Intro' }]" />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    const root = document.querySelector('[data-tour]') as HTMLElement
    const anchor = document.querySelector('[data-tour-anchor]') as HTMLElement
    const bubble = document.querySelector('.pxd-popover--wrapper') as HTMLElement

    expect(root.getAttribute('data-centered')).toBe('true')
    expect(anchor.style.top).toBe(`${window.innerHeight / 2}px`)
    expect(anchor.style.left).toBe(`${window.innerWidth / 2}px`)
    expect(bubble.className).toContain('pxd-tour--popover-centered')

    wrapper.unmount()
  })

  it('tracks target position changes while the step is active', async () => {
    const target = document.createElement('button')
    let targetRect = {
      top: 100,
      left: 200,
      width: 40,
      height: 20,
      right: 240,
      bottom: 120,
      x: 200,
      y: 100,
    }

    target.getBoundingClientRect = () =>
      ({
        ...targetRect,
        toJSON: () => ({}),
      }) as DOMRect

    document.body.appendChild(target)

    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { visible: ref(true), target }
      },
      template: `<Tour v-model="visible" :steps="[{ target: () => target }]" />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    targetRect = {
      top: 300,
      left: 400,
      width: 60,
      height: 30,
      right: 460,
      bottom: 330,
      x: 400,
      y: 300,
    }

    await new Promise(requestAnimationFrame)
    await nextTick()

    const mask = document.querySelector('.pxd-tour--mask') as HTMLElement

    expect(mask.style.top).toBe('300px')
    expect(mask.style.left).toBe('400px')
    expect(mask.style.width).toBe('60px')
    expect(mask.style.height).toBe('30px')

    wrapper.unmount()
  })

  it('clamps an out-of-range current step', async () => {
    const target = makeTarget()

    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { visible: ref(true), current: ref(5), target }
      },
      template: `<Tour
        v-model="visible"
        v-model:current="current"
        :steps="[{ target: () => target, title: 'Only' }]"
      />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    const content = document.querySelector('.pxd-tour--content') as HTMLElement

    expect(content.textContent).toContain('Only')
    expect(content.textContent).toContain('1/1')

    wrapper.unmount()
  })

  it('closes when opened without steps', async () => {
    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { visible: ref(true) }
      },
      template: `<Tour v-model="visible" :steps="[]" />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    expect((wrapper.vm as unknown as { visible: boolean }).visible).toBe(false)

    wrapper.unmount()
  })

  it('labels the popover dialog from the active step title', async () => {
    const target = makeTarget()

    const Demo = defineComponent({
      components: { Tour },
      setup() {
        return { visible: ref(true), target }
      },
      template: `<Tour v-model="visible" :steps="[{ target: () => target, title: 'One' }]" />`,
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await flush()

    const dialog = document.querySelector('.pxd-popover--wrapper') as HTMLElement
    const title = document.querySelector('.pxd-tour--content h4') as HTMLElement

    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id)

    wrapper.unmount()
  })
})
