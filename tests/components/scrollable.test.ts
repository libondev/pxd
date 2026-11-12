import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
import PScrollable from '../../src/components/scrollable/index.vue'
import { installMutationObserverMock, installResizeObserverMock } from '../helpers/setup'

describe('scrollable', () => {
  let wrapper: ReturnType<typeof mount<typeof PScrollable>>

  const createLargeContent = (width = 1000, height = 1000) => {
    const content = document.createElement('div')
    content.style.width = `${width}px`
    content.style.height = `${height}px`
    content.textContent = 'Large Content'
    return content
  }

  /** happy-dom has no layout, so scroll ranges are written by hand. */
  const stubMetrics = (el: HTMLElement, metrics: Record<string, number>) => {
    for (const [key, value] of Object.entries(metrics)) {
      Object.defineProperty(el, key, { configurable: true, writable: true, value })
    }
  }

  beforeEach(() => {
    // Mock window resize event listener handling
    vi.spyOn(window, 'addEventListener')
    vi.spyOn(window, 'removeEventListener')
    // Mock document event listeners for drag operations
    vi.spyOn(document, 'addEventListener')
    vi.spyOn(document, 'removeEventListener')
    vi.spyOn(document.body.classList, 'add')
    vi.spyOn(document.body.classList, 'remove')
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders correctly with default props', async () => {
    wrapper = mount(PScrollable, {
      slots: {
        default: '<div style="width: 200px; height: 200px;">Content</div>',
      },
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.pxd-scrollable').exists()).toBe(true)
    expect(wrapper.find('.pxd-scrollable--content').exists()).toBe(true)
    // expect(wrapper.find('.pxd-scrollable--scrollbar-y').isVisible()).toBe(true)
    // expect(wrapper.find('.pxd-scrollable--scrollbar-x').isVisible()).toBe(true)
    expect(wrapper.find('.pxd-fader--item.horizontal').exists()).toBe(true)
    expect(wrapper.find('.pxd-fader--item.vertical').exists()).toBe(true)
  })

  it('emits scroll event when content is scrolled', async () => {
    wrapper = mount(PScrollable, {
      slots: {
        default: () => createLargeContent(),
      },
      attachTo: document.body,
    })

    const scrollContainer = wrapper.find('.pxd-scrollable--content').element as HTMLElement
    await nextTick()

    scrollContainer.scrollTop = 100
    scrollContainer.dispatchEvent(new Event('scroll'))
    await nextTick()

    expect(wrapper.emitted('scroll')).toBeTruthy()
    expect(wrapper.emitted('scroll')?.[0]?.[0]).toBeInstanceOf(Event)
  })

  it('re-measures on content size and transition class changes', async () => {
    const resize = installResizeObserverMock()
    const mutation = installMutationObserverMock()

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})

    wrapper = mount(PScrollable, {
      slots: {
        default: '<div class="probe">Content</div>',
      },
      attachTo: document.body,
    })
    await nextTick()

    const content = wrapper.find('.pxd-scrollable--content').element as HTMLElement
    const probe = wrapper.find('.probe').element as HTMLElement
    const track = () => wrapper.find('.pxd-scrollable--scrollbar-y')

    expect(resize.observed()).toContain(probe)

    Object.defineProperties(content, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 100 },
    })

    const element = track().element
    ;(wrapper.vm as unknown as { forceUpdate: () => void }).forceUpdate()
    await nextTick()

    expect(track().classes()).toContain('opacity-0!')

    Object.defineProperty(content, 'scrollHeight', { configurable: true, value: 400 })
    resize.fireAll()
    await nextTick()

    expect(track().element).toBe(element)
    expect(track().classes()).not.toContain('opacity-0!')

    Object.defineProperty(content, 'scrollHeight', { configurable: true, value: 100 })
    probe.classList.add('pxd-tree-transition-leave-active')
    mutation.fireAll()
    await nextTick()

    expect(track().classes()).toContain('opacity-0!')
  })

  it('emits bottom once per direction and suppresses it while loading', async () => {
    wrapper = mount(PScrollable, {
      props: { bottomThreshold: 0 },
      attachTo: document.body,
    })
    await nextTick()

    const content = wrapper.find('.pxd-scrollable--content').element as HTMLElement

    stubMetrics(content, {
      clientHeight: 100,
      scrollHeight: 200,
      clientWidth: 100,
      scrollWidth: 200,
      scrollTop: 0,
      scrollLeft: 0,
    })

    const scrollTo = async (top: number, left: number) => {
      content.scrollTop = top
      content.scrollLeft = left
      content.dispatchEvent(new Event('scroll'))
      await nextTick()
    }

    await scrollTo(0, 0)
    expect(wrapper.emitted('bottom')).toBeUndefined()

    await scrollTo(100, 100)
    expect(wrapper.emitted('bottom')?.map((args) => args[0])).toEqual(['vertical', 'horizontal'])

    await scrollTo(100, 100)
    expect(wrapper.emitted('bottom')).toHaveLength(2)

    await scrollTo(50, 50)
    await wrapper.setProps({ loading: true })
    await scrollTo(100, 100)
    await scrollTo(50, 50)
    await scrollTo(100, 100)
    expect(wrapper.emitted('bottom')).toHaveLength(2)
  })

  it('drags the vertical thumb to a proportional scroll offset', async () => {
    wrapper = mount(PScrollable, { attachTo: document.body })
    await nextTick()

    const wrapperEl = wrapper.find('.pxd-scrollable').element as HTMLElement
    const content = wrapper.find('.pxd-scrollable--content').element as HTMLElement

    stubMetrics(wrapperEl, { clientWidth: 100, clientHeight: 100 })
    stubMetrics(content, {
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 500,
      scrollTop: 0,
      scrollLeft: 0,
    })

    ;(wrapper.vm as unknown as { forceUpdate: () => void }).forceUpdate()
    await nextTick()

    const thumb = wrapper.find('.pxd-scrollable--scrollbar-y .pxd-scrollable--thumb').element

    thumb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientY: 0 }))
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 35 }))

    expect(content.scrollTop).toBe(200)

    document.dispatchEvent(new MouseEvent('mouseup'))
  })
})
