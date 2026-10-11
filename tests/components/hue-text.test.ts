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

  it('should derive a stable hue from the text', () => {
    const first = mount(HueText, { props: { text: 'Libon' } })
    const second = mount(HueText, { props: { text: 'Libon' } })
    const other = mount(HueText, { props: { text: 'Geist' } })

    const hueOf = (wrapper: ReturnType<typeof mount>) =>
      (wrapper.vm as any).hueStyle['--pxd-hue-h'] as number

    for (const hue of [hueOf(first), hueOf(second), hueOf(other)]) {
      expect(Number.isInteger(hue)).toBe(true)
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThan(360)
    }

    expect(hueOf(second)).toBe(hueOf(first))
    expect(hueOf(other)).not.toBe(hueOf(first))

    first.unmount()
    second.unmount()
    other.unmount()
  })

  it('should update the hue when the text changes', async () => {
    const wrapper = mount(HueText, { props: { text: 'Libon' } })

    const before = (wrapper.vm as any).hueStyle['--pxd-hue-h'] as number

    await wrapper.setProps({ text: 'Geist' })

    expect((wrapper.vm as any).hueStyle['--pxd-hue-h']).not.toBe(before)

    wrapper.unmount()
  })

  it('should default the hue to zero without text', () => {
    const wrapper = mount(HueText)

    expect((wrapper.vm as any).hueStyle['--pxd-hue-h']).toBe(0)
    expect(wrapper.attributes('data-tinted')).toBe('false')

    wrapper.unmount()
  })

  it('should expose the tinted state for styling', () => {
    const wrapper = mount(HueText, { props: { text: 'Libon', tinted: true } })

    expect(wrapper.attributes('data-tinted')).toBe('true')
    expect(wrapper.attributes('style')).toContain('--pxd-hue-h')

    wrapper.unmount()
  })
})
