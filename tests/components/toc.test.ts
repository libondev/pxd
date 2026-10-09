import type { TocItem } from '../../src/components/toc/types'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { computed, defineComponent, h, nextTick, ref } from 'vue'
import Toc from '../../src/components/toc/index.vue'
import { installMutationObserverMock } from '../helpers/setup'

const SELECTOR = '.prose > h2[id], .prose > h3[id]'

/** happy-dom has no layout and no scroll range, so the metrics are written by hand. */
function stubMetrics(el: Window | Element, metrics: Record<string, number>) {
  for (const [key, value] of Object.entries(metrics)) {
    Object.defineProperty(el, key, { configurable: true, writable: true, value })
  }
}

function stubRect(el: Element, top: number, bottom: number) {
  Object.defineProperty(el, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ top, bottom, height: bottom - top, left: 0, right: 0, width: 0 }),
  })
}

/** Headings live in a `.prose` container; `parent` stands in for a scrolled container. */
function stubHeadings(
  entries: { top: number; tag?: 'h2' | 'h3' }[],
  parent: HTMLElement = document.body,
) {
  const prose = document.createElement('div')

  prose.className = 'prose'
  parent.appendChild(prose)

  return entries.map((entry, index) => {
    const el = document.createElement(entry.tag ?? 'h2')

    el.id = `heading-${index}`
    el.textContent = `Heading ${index}`
    prose.appendChild(el)

    stubRect(el, entry.top, entry.top + 20)

    return el
  })
}

function click(el: Element, init: MouseEventInit = {}) {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init })

  el.dispatchEvent(event)

  return event
}

/** The outline is read on mount and on mutation, both through a rAF-scheduled pass. */
async function settle() {
  await nextTick()
  await nextTick()
}

describe('toc', () => {
  let scrollTo: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})

    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
    for (const key of ['scrollTop', 'scrollHeight', 'clientHeight']) {
      delete (document.documentElement as unknown as Record<string, unknown>)[key]
    }
    delete (window as unknown as Record<string, unknown>).scrollY
  })

  it('renders nothing when the selector matches no heading', () => {
    const wrapper = mount(Toc, { props: { selector: SELECTOR } })

    expect(wrapper.find('nav').exists()).toBe(false)

    wrapper.unmount()
  })

  it('lets the consumer name the nav landmark through fallthrough', () => {
    stubHeadings([{ top: 0 }, { top: 0, tag: 'h3' }, { top: 0 }])

    const wrapper = mount(Toc, {
      props: { selector: SELECTOR },
      attrs: { 'aria-label': 'On this page' },
    })
    const links = wrapper.findAll('a')

    expect(wrapper.find('nav').attributes('aria-label')).toBe('On this page')
    expect(links).toHaveLength(3)
    expect(links[0]!.attributes('href')).toBe('#heading-0')
    expect(links[0]!.text()).toBe('Heading 0')

    wrapper.unmount()
  })

  it('skips a heading that has no id', () => {
    const prose = document.createElement('div')

    prose.className = 'prose'
    prose.innerHTML = '<h2>No id</h2><h2 id="kept">Kept</h2>'
    document.body.appendChild(prose)

    const wrapper = mount(Toc, { props: { selector: SELECTOR } })

    expect(wrapper.findAll('a')).toHaveLength(1)
    expect(wrapper.find('a').attributes('href')).toBe('#kept')

    wrapper.unmount()
  })

  it('indents nested levels relative to the shallowest heading', () => {
    // Shallowest is `h3`, not `h1`: an outline of only deep levels has no top level.
    const prose = document.createElement('div')

    prose.className = 'prose'
    prose.innerHTML = '<h3 id="a">A</h3><h4 id="b">B</h4><h3 id="c">C</h3>'
    document.body.appendChild(prose)

    const wrapper = mount(Toc, { props: { selector: '.prose > :is(h3, h4)[id]' } })
    const links = wrapper.findAll('a')

    expect(links[0]!.attributes('style')).toContain('padding-inline-start: 8px')
    expect(links[1]!.attributes('style')).toContain('padding-inline-start: 22px')
    expect(links[2]!.attributes('style')).toContain('padding-inline-start: 8px')

    wrapper.unmount()
  })

  it('forwards attributes and class to the nav landmark', () => {
    stubHeadings([{ top: 0 }])

    const wrapper = mount(Toc, {
      props: { selector: SELECTOR },
      attrs: { 'aria-labelledby': 'docs-toc-title', class: 'custom' },
    })

    const nav = wrapper.find('nav')

    expect(nav.attributes('aria-labelledby')).toBe('docs-toc-title')
    expect(nav.classes()).toContain('custom')
    expect(wrapper.find('ol').classes()).not.toContain('custom')

    wrapper.unmount()
  })

  it('renders the base item class from script scope', () => {
    stubHeadings([{ top: 0 }])

    const wrapper = mount(Toc, { props: { selector: SELECTOR } })
    const link = wrapper.find('a')

    expect(link.classes()).toContain('pxd-toc-item')
    expect(link.classes()).toContain('rounded-md')
    expect(link.classes()).toContain('text-foreground-secondary')

    wrapper.unmount()
  })

  it('scrolls the heading below the offset and emits item-click', () => {
    stubHeadings([{ top: 500 }])
    stubMetrics(window, { scrollY: 200 })

    const wrapper = mount(Toc, { props: { selector: SELECTOR, offset: 80 } })

    const event = click(wrapper.find('a').element)

    expect(scrollTo).toHaveBeenCalledWith({ top: 620, behavior: 'smooth' })
    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.emitted('item-click')?.[0]?.[0]).toMatchObject({ id: 'heading-0' })

    wrapper.unmount()
  })

  it('clamps a heading that sits above the offset to the top of the scroll range', () => {
    stubHeadings([{ top: 10 }])
    stubMetrics(window, { scrollY: 0 })

    const wrapper = mount(Toc, { props: { selector: SELECTOR, offset: 80 } })

    click(wrapper.find('a').element)

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })

    wrapper.unmount()
  })

  it('leaves modified clicks to the browser', () => {
    stubHeadings([{ top: 500 }])
    stubMetrics(window, { scrollY: 200 })

    const wrapper = mount(Toc, { props: { selector: SELECTOR } })

    const event = click(wrapper.find('a').element, { ctrlKey: true, button: 0 })

    expect(event.defaultPrevented).toBe(false)
    expect(scrollTo).not.toHaveBeenCalled()
    expect(wrapper.emitted('item-click')).toHaveLength(1)

    wrapper.unmount()
  })

  it('scrolls a custom container instead of the window', () => {
    const container = document.createElement('div')
    const containerScrollTo = vi.fn()

    document.body.appendChild(container)
    stubMetrics(container, { scrollTop: 50 })
    Object.defineProperty(container, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ top: 0, bottom: 400, height: 400, left: 0, right: 0, width: 0 }),
    })
    Object.defineProperty(container, 'scrollTo', { configurable: true, value: containerScrollTo })

    stubHeadings([{ top: 300 }], container)

    const wrapper = mount(Toc, {
      props: { selector: SELECTOR, scrollTarget: container, offset: 80 },
    })

    click(wrapper.find('a').element)

    expect(containerScrollTo).toHaveBeenCalledWith({ top: 270, behavior: 'smooth' })
    expect(scrollTo).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('marks the scrolled-to heading with aria-current and emits active-change', async () => {
    const headings = stubHeadings([{ top: -200 }, { top: -50 }, { top: 300 }])
    stubMetrics(document.documentElement, { scrollTop: 250, scrollHeight: 2000, clientHeight: 800 })

    const wrapper = mount(Toc, { props: { selector: SELECTOR, offset: 80 } })
    await settle()

    expect(wrapper.findAll('a')[1]!.attributes('aria-current')).toBe('location')
    expect(wrapper.findAll('a')[0]!.attributes('aria-current')).toBeUndefined()
    expect(wrapper.emitted('active-change')?.at(-1)?.[0]).toMatchObject({ id: 'heading-1' })

    stubRect(headings[2]!, 40, 60)
    window.dispatchEvent(new Event('scroll'))
    await settle()

    expect(wrapper.findAll('a')[2]!.attributes('aria-current')).toBe('location')
    expect(wrapper.findAll('a')[1]!.attributes('aria-current')).toBeUndefined()
    expect(wrapper.emitted('active-change')?.at(-1)?.[0]).toMatchObject({ id: 'heading-2' })

    wrapper.unmount()
  })

  it('exposes the outline, the active id and an imperative scrollTo', async () => {
    stubHeadings([{ top: -200 }, { top: -50 }, { top: 300 }])
    stubMetrics(document.documentElement, { scrollTop: 250, scrollHeight: 2000, clientHeight: 800 })

    const wrapper = mount(Toc, { props: { selector: SELECTOR, offset: 80 } })
    await settle()

    const vm = wrapper.vm as unknown as {
      activeId: string | null
      items: TocItem[]
      scrollTo: (id: string, behavior?: string) => boolean
    }

    expect(vm.activeId).toBe('heading-1')
    expect(vm.items.map((item) => item.id)).toEqual(['heading-0', 'heading-1', 'heading-2'])
    expect(vm.items[1]!.level).toBe(2)
    expect(vm.scrollTo('nope')).toBe(false)

    stubMetrics(window, { scrollY: 0 })
    expect(vm.scrollTo('heading-2', 'instant')).toBe(true)
    expect(scrollTo).toHaveBeenCalledWith({ top: 220, behavior: 'instant' })

    wrapper.unmount()
  })

  it('re-reads the outline when the selector changes', async () => {
    stubHeadings([{ top: 0 }, { top: 0 }])

    const wrapper = mount(Toc, { props: { selector: '.prose > h2[id]' } })
    await settle()

    expect(wrapper.findAll('a')).toHaveLength(2)

    await wrapper.setProps({ selector: '.prose > h2#heading-1' })
    await settle()

    expect(wrapper.findAll('a')).toHaveLength(1)
    expect(wrapper.find('a').attributes('href')).toBe('#heading-1')

    wrapper.unmount()
  })

  it('re-reads the outline when a heading arrives', async () => {
    const observers = installMutationObserverMock()

    stubHeadings([{ top: 0 }, { top: 0 }])

    const wrapper = mount(Toc, { props: { selector: SELECTOR } })
    await settle()

    expect(wrapper.findAll('a')).toHaveLength(2)
    expect(observers.observed()).toEqual([document.body])

    const prose = document.querySelector('.prose')!
    const added = document.createElement('h2')

    added.id = 'heading-late'
    added.textContent = 'Arrived late'
    prose.appendChild(added)

    observers.fireAll()
    await settle()

    expect(wrapper.findAll('a')).toHaveLength(3)
    expect(wrapper.findAll('a')[2]!.text()).toBe('Arrived late')

    wrapper.unmount()
  })

  it('watches the scrolled container instead of the document', async () => {
    const observers = installMutationObserverMock()
    const container = document.createElement('div')

    document.body.appendChild(container)
    stubHeadings([{ top: 0 }, { top: 0 }], container)

    const wrapper = mount(Toc, { props: { selector: SELECTOR, scrollTarget: container } })
    await settle()

    expect(wrapper.findAll('a')).toHaveLength(2)
    expect(observers.observed()).toEqual([container])

    const prose = document.querySelector('.prose')!
    const added = document.createElement('h2')

    added.id = 'heading-late'
    added.textContent = 'Arrived late'
    prose.appendChild(added)

    observers.fireAll()
    await settle()

    expect(wrapper.findAll('a')).toHaveLength(3)

    wrapper.unmount()
  })

  it('keeps the same outline object when a re-read finds no change', async () => {
    const observers = installMutationObserverMock()

    stubHeadings([{ top: 0 }, { top: 0 }])

    const wrapper = mount(Toc, { props: { selector: SELECTOR } })
    await settle()

    const vm = wrapper.vm as unknown as { items: TocItem[] }
    const before = vm.items

    observers.fireAll()
    await settle()

    // A fresh array would hand the spy a new target list for nothing.
    expect(vm.items).toBe(before)

    const prose = document.querySelector('.prose')!
    const added = document.createElement('h2')

    added.id = 'heading-new'
    prose.appendChild(added)

    observers.fireAll()
    await settle()

    expect(vm.items).not.toBe(before)
    expect(vm.items).toHaveLength(3)

    wrapper.unmount()
  })

  it('does not re-announce the active heading when the outline is re-read', async () => {
    const observers = installMutationObserverMock()

    const headings = stubHeadings([{ top: -200 }, { top: -50 }, { top: 300 }])
    stubMetrics(document.documentElement, { scrollTop: 250, scrollHeight: 2000, clientHeight: 800 })

    const wrapper = mount(Toc, { props: { selector: SELECTOR } })
    await settle()

    expect(wrapper.emitted('active-change')).toHaveLength(1)

    // The document grew and the outline did not: the reader has not moved.
    stubRect(headings[0]!, -210, -190)
    observers.fireAll()
    await settle()

    expect(wrapper.emitted('active-change')).toHaveLength(1)

    wrapper.unmount()
  })

  it('scrolls the matching row into view when the outline shrinks', async () => {
    const observers = installMutationObserverMock()

    const prose = document.createElement('div')

    prose.className = 'prose'
    prose.innerHTML = '<h2 id="gone">Gone</h2><h2 id="a">A</h2><h2 id="b">B</h2>'
    document.body.appendChild(prose)

    stubMetrics(document.documentElement, { scrollTop: 250, scrollHeight: 2000, clientHeight: 800 })

    const wrapper = mount(Toc, { props: { selector: SELECTOR } })
    await settle()

    expect(wrapper.findAll('a')).toHaveLength(3)

    document.getElementById('gone')!.remove()
    observers.fireAll()
    await settle()

    expect(wrapper.findAll('a')).toHaveLength(2)
    expect(wrapper.findAll('a')[0]!.attributes('href')).toBe('#a')

    wrapper.unmount()
  })

  it('exposes a reactive outline through a template ref', async () => {
    const observers = installMutationObserverMock()

    stubHeadings([{ top: 0 }, { top: 0 }])

    const Parent = defineComponent({
      components: { PToc: Toc },
      setup() {
        const toc = ref()
        const count = computed(() => toc.value?.items?.length ?? 0)

        return { toc, count, selector: '.prose > h2[id]' }
      },
      // The parent has to *read* the count for the expose proxy to be tracked.
      template: '<div data-test="count">{{ count }}</div><PToc ref="toc" :selector="selector" />',
    })

    const wrapper = mount(Parent)
    await settle()

    const counter = wrapper.find('[data-test="count"]')

    expect(counter.text()).toBe('2')

    // A heading that arrives late has to reach the parent, not just the toc.
    const prose = document.querySelector('.prose')!
    const added = document.createElement('h2')

    added.id = 'heading-late'
    prose.appendChild(added)

    observers.fireAll()
    await settle()

    expect(counter.text()).toBe('3')

    wrapper.unmount()
  })

  it('forwards item, index, depth, active and select to the item slot', async () => {
    stubHeadings([{ top: 500 }])
    stubMetrics(window, { scrollY: 200 })

    const wrapper = mount(Toc, {
      props: { selector: SELECTOR, offset: 80 },
      slots: {
        item: (props: {
          item: TocItem
          index: number
          depth: number
          active: boolean
          select: (event: MouseEvent) => void
        }) =>
          h(
            'button',
            {
              'data-test': 'custom',
              onClick: (event: MouseEvent) => props.select(event),
            },
            `${props.index}:${props.depth}:${props.active}`,
          ),
      },
    })

    const rendered = wrapper.findAll('[data-test="custom"]')

    expect(rendered).toHaveLength(1)
    expect(rendered[0]!.text()).toBe('0:0:false')
    expect(wrapper.find('a').exists()).toBe(false)
    // A slot owns its own indent, and `select` keeps the offset-aware scroll.
    expect(rendered[0]!.attributes('style')).toBeUndefined()

    click(rendered[0]!.element)
    await settle()

    expect(scrollTo).toHaveBeenCalledWith({ top: 620, behavior: 'smooth' })

    wrapper.unmount()
  })
})
