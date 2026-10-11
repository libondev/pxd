import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import HueText from '../../src/components/hue-text/index.vue'

describe('hue-text', () => {
  it('renders properly', () => {
    const wrapper = mount(HueText, {
      props: {
        text: 'Hue',
      },
    })

    expect(wrapper.classes()).toContain('pxd-hue-text')
    expect(wrapper.text()).toBe('Hue')

    wrapper.unmount()
  })

  it('should render the prefix and suffix slots', () => {
    const wrapper = mount(HueText, {
      props: {
        text: 'Libon',
      },
      slots: {
        prefix: '<i class="prefix-icon" />',
        suffix: '<i class="suffix-icon" />',
      },
    })

    expect(wrapper.find('.prefix-icon').exists()).toBe(true)
    expect(wrapper.find('.suffix-icon').exists()).toBe(true)
    expect(wrapper.text()).toBe('Libon')

    wrapper.unmount()
  })

  it('should not render affix wrappers without the slots', () => {
    const wrapper = mount(HueText, { props: { text: 'Libon' } })

    expect(wrapper.find('.prefix-icon').exists()).toBe(false)
    expect(wrapper.element.children).toHaveLength(0)

    wrapper.unmount()
  })

  it('should derive a stable color from the text', () => {
    const first = mount(HueText, { props: { text: 'Libon' } })
    const second = mount(HueText, { props: { text: 'Libon' } })
    const other = mount(HueText, { props: { text: 'Geist' } })

    const colorOf = (wrapper: ReturnType<typeof mount>) =>
      (wrapper.vm as any).hueStyle.color as string

    expect(colorOf(first)).toMatch(/^#[0-9a-f]{6}$/)
    expect(colorOf(second)).toBe(colorOf(first))
    expect(colorOf(other)).not.toBe(colorOf(first))

    first.unmount()
    second.unmount()
    other.unmount()
  })

  it('should update the color when the text changes', async () => {
    const wrapper = mount(HueText, { props: { text: 'Libon' } })

    const before = (wrapper.vm as any).hueStyle.color as string

    await wrapper.setProps({ text: 'Geist' })

    expect((wrapper.vm as any).hueStyle.color).not.toBe(before)

    wrapper.unmount()
  })

  it('should not paint a background unless tinted', () => {
    const wrapper = mount(HueText, { props: { text: 'Libon' } })

    expect((wrapper.vm as any).hueStyle.backgroundColor).toBeUndefined()

    wrapper.unmount()
  })

  it('should paint a tinted background', () => {
    const wrapper = mount(HueText, { props: { text: 'Libon', tinted: true } })
    const color = (wrapper.vm as any).hueStyle.color as string

    expect(wrapper.classes()).toContain('px-1.5')
    expect((wrapper.vm as any).hueStyle.backgroundColor).toBe(
      `color-mix(in srgb, ${color} 12%, transparent)`,
    )

    wrapper.unmount()
  })
})
