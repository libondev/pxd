import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ScrollText from '../../src/components/scroll-text/index.vue'

function mockSizes(wrapper: ReturnType<typeof mount>, wrapWidth: number, contentWidth: number) {
  const root = wrapper.element as HTMLElement
  const content = wrapper.find('.pxd-scroll-text--content').element as HTMLElement

  Object.defineProperty(root, 'clientWidth', {
    configurable: true,
    get: () => wrapWidth,
  })
  Object.defineProperty(content, 'scrollWidth', {
    configurable: true,
    get: () => contentWidth,
  })
}

describe('scroll-text', () => {
  it('renders properly', () => {
    const wrapper = mount(ScrollText)

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('pxd-scroll-text')

    wrapper.unmount()
  })

  it('should render text prop', () => {
    const wrapper = mount(ScrollText, {
      props: {
        text: 'Sidebar label',
      },
    })

    expect(wrapper.text()).toContain('Sidebar label')

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(ScrollText, {
      slots: {
        default: 'Slot label',
      },
    })

    expect(wrapper.text()).toContain('Slot label')

    wrapper.unmount()
  })

  it('should render as span by default', () => {
    const wrapper = mount(ScrollText, {
      props: {
        text: 'Label',
      },
    })

    expect(wrapper.element.tagName).toBe('SPAN')

    wrapper.unmount()
  })

  it('should render custom as element', () => {
    const wrapper = mount(ScrollText, {
      props: {
        as: 'div',
        text: 'Label',
      },
    })

    expect(wrapper.element.tagName).toBe('DIV')

    wrapper.unmount()
  })

  it('should mark overflow and set css vars when content overflows', async () => {
    const wrapper = mount(ScrollText, {
      props: {
        text: 'Short',
        speed: 40,
      },
    })

    mockSizes(wrapper, 100, 300)
    await wrapper.setProps({ text: 'Very long sidebar label that overflows' })
    await wrapper.vm.$nextTick()

    expect(wrapper.attributes('data-overflow')).toBe('true')

    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('--scroll-text-distance: 200px')
    expect(style).toContain('--scroll-text-duration: 5s')

    wrapper.unmount()
  })

  it('should not mark overflow when content fits', async () => {
    const wrapper = mount(ScrollText, {
      props: {
        text: 'Fits',
      },
    })

    mockSizes(wrapper, 200, 120)
    await wrapper.setProps({ text: 'Still fits' })
    await wrapper.vm.$nextTick()

    expect(wrapper.attributes('data-overflow')).toBe('false')
    expect(wrapper.attributes('style') ?? '').not.toContain('--scroll-text-distance')

    wrapper.unmount()
  })

  it('should clear overflow when content shrinks to fit', async () => {
    const wrapper = mount(ScrollText, {
      props: {
        text: 'Long',
      },
    })

    mockSizes(wrapper, 100, 300)
    await wrapper.setProps({ text: 'Overflowing label' })
    await wrapper.vm.$nextTick()
    expect(wrapper.attributes('data-overflow')).toBe('true')

    mockSizes(wrapper, 100, 80)
    await wrapper.setProps({ text: 'Ok' })
    await wrapper.vm.$nextTick()

    expect(wrapper.attributes('data-overflow')).toBe('false')
    expect(wrapper.attributes('style') ?? '').not.toContain('--scroll-text-distance')

    wrapper.unmount()
  })

  it('should update duration when speed changes', async () => {
    const wrapper = mount(ScrollText, {
      props: {
        text: 'Label',
        speed: 40,
      },
    })

    mockSizes(wrapper, 100, 300)
    await wrapper.setProps({ text: 'Overflowing label', speed: 50 })
    await wrapper.vm.$nextTick()

    expect(wrapper.attributes('style') ?? '').toContain('--scroll-text-duration: 4s')

    wrapper.unmount()
  })

  it('should fall back to default speed for invalid values', async () => {
    const wrapper = mount(ScrollText, {
      props: {
        text: 'Label',
        speed: 0,
      },
    })

    mockSizes(wrapper, 100, 300)
    await wrapper.setProps({ text: 'Overflowing label' })
    await wrapper.vm.$nextTick()

    expect(wrapper.attributes('data-overflow')).toBe('true')
    expect(wrapper.attributes('style') ?? '').toContain('--scroll-text-duration: 5s')

    wrapper.unmount()
  })
})
