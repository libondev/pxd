import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import PScrollable from '../../src/components/scrollable/index.vue'

describe('pScrollable', () => {
  let wrapper: ReturnType<typeof mount<typeof PScrollable>>

  const createLargeContent = (width = 1000, height = 1000) => {
    const content = document.createElement('div')
    content.style.width = `${width}px`
    content.style.height = `${height}px`
    content.textContent = 'Large Content'
    return content
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
  })

  it('renders correctly with default props', () => {
    wrapper = mount(PScrollable, {
      slots: {
        default: '<div style="width: 200px; height: 200px;">Content</div>',
      },
    })
    expect(wrapper.find('.pxd-scrollable').exists()).toBe(true)
    expect(wrapper.find('.pxd-scrollable--content').exists()).toBe(true)
    expect(wrapper.find('.pxd-scrollable--scrollbar-y').isVisible()).toBe(true)
    expect(wrapper.find('.pxd-scrollable--scrollbar-x').isVisible()).toBe(true)
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
})
