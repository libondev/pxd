import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import BorderBeam from '../../src/components/border-beam/index.vue'

describe('border-beam', () => {
  it('renders properly', () => {
    const wrapper = mount(BorderBeam, {
      slots: {
        default: 'Beam content',
      },
    })

    expect(wrapper.classes()).toContain('pxd-border-beam')
    expect(wrapper.text()).toBe('Beam content')
    expect(wrapper.find('.pxd-border-beam--bloom').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render the default slot', () => {
    const wrapper = mount(BorderBeam, {
      slots: {
        default: 'Slot Content',
      },
    })

    expect(wrapper.text()).toBe('Slot Content')

    wrapper.unmount()
  })

  it('should set the default variant and disabled state', () => {
    const wrapper = mount(BorderBeam)

    expect(wrapper.attributes('data-variant')).toBe('colorful')
    expect(wrapper.attributes('data-disabled')).toBe('false')

    wrapper.unmount()
  })

  it('should reflect the disabled prop on data-disabled', async () => {
    const wrapper = mount(BorderBeam, {
      props: {
        disabled: true,
      },
    })

    expect(wrapper.attributes('data-disabled')).toBe('true')

    await wrapper.setProps({ disabled: false })
    expect(wrapper.attributes('data-disabled')).toBe('false')

    wrapper.unmount()
  })

  it('should set the strength variable clamped to [0, 1]', () => {
    const wrapper = mount(BorderBeam, {
      props: {
        strength: 0.5,
      },
    })

    expect(wrapper.attributes('style')).toContain('--border-beam-strength: 0.5')

    wrapper.unmount()
  })

  it('should clamp strength above 1 to 1', () => {
    const wrapper = mount(BorderBeam, {
      props: {
        strength: 2,
      },
    })

    expect(wrapper.attributes('style')).toContain('--border-beam-strength: 1')

    wrapper.unmount()
  })

  it('should clamp negative strength to 0', () => {
    const wrapper = mount(BorderBeam, {
      props: {
        strength: -0.5,
      },
    })

    expect(wrapper.attributes('style')).toContain('--border-beam-strength: 0')

    wrapper.unmount()
  })

  it('should not emit color variables when color is not set', () => {
    const wrapper = mount(BorderBeam)

    const style = wrapper.attributes('style') ?? ''

    expect(style).not.toContain('--border-beam-stroke-color-1')
    expect(style).not.toContain('--border-beam-glow-color-1')

    wrapper.unmount()
  })

  it('should apply a single color to all spots', () => {
    const wrapper = mount(BorderBeam, {
      props: {
        color: '#ff0000',
      },
    })

    const style = wrapper.attributes('style') ?? ''

    for (let index = 1; index <= 9; index++) {
      expect(style).toContain(`--border-beam-stroke-color-${index}: #ff0000`)
      expect(style).toContain(
        `--border-beam-glow-color-${index}: color-mix(in srgb, #ff0000, transparent 30%)`,
      )
    }

    wrapper.unmount()
  })

  it('should distribute color stops sorted by position', () => {
    const wrapper = mount(BorderBeam, {
      props: {
        color: [
          { color: '#0000ff', position: 1 },
          { color: '#ff0000', position: 0 },
          { color: '#00ff00', position: 0.5 },
        ],
      },
    })

    const style = wrapper.attributes('style') ?? ''

    expect(style).toContain('--border-beam-stroke-color-1: #ff0000')
    expect(style).toContain('--border-beam-stroke-color-2: #00ff00')
    expect(style).toContain('--border-beam-stroke-color-3: #0000ff')
    expect(style).toContain('--border-beam-stroke-color-4: #ff0000')

    wrapper.unmount()
  })

  it('should default stop position to 0.5 when sorting', () => {
    const wrapper = mount(BorderBeam, {
      props: {
        color: [{ color: '#0000ff' }, { color: '#ff0000', position: 0 }],
      },
    })

    const style = wrapper.attributes('style') ?? ''

    expect(style).toContain('--border-beam-stroke-color-1: #ff0000')
    expect(style).toContain('--border-beam-stroke-color-2: #0000ff')

    wrapper.unmount()
  })

  it('should not emit color variables for an empty color array', () => {
    const wrapper = mount(BorderBeam, {
      props: {
        color: [],
      },
    })

    const style = wrapper.attributes('style') ?? ''

    expect(style).not.toContain('--border-beam-stroke-color-1')
    expect(style).not.toContain('--border-beam-glow-color-1')

    wrapper.unmount()
  })

  it('should pass through attrs to the root element', () => {
    const wrapper = mount(BorderBeam, {
      attrs: {
        class: 'custom-class',
        style: 'width: 120px; height: 80px;',
      },
    })

    expect(wrapper.classes()).toContain('custom-class')
    expect(wrapper.attributes('style')).toContain('width: 120px')

    wrapper.unmount()
  })
})
