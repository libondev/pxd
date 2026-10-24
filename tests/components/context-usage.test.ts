import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ContextUsage from '../../src/components/context-usage/index.vue'

const data = [
  { name: 'System prompt', tokens: 7000 },
  { name: 'Tools', tokens: 2000 },
  { name: 'Messages', tokens: 1000 },
]

describe('context-usage', () => {
  it('renders one segment and one legend row per segment', () => {
    const wrapper = mount(ContextUsage, {
      props: { total: 200000, data },
    })

    expect(wrapper.find('[data-context-usage]').exists()).toBe(true)
    expect(wrapper.findAll('.pxd-context-usage--segment').length).toBe(3)

    const rows = wrapper.findAll('.pxd-context-usage--legend li')
    expect(rows.length).toBe(3)
    expect(rows[0].text()).toContain('System prompt')
    expect(rows[1].text()).toContain('Tools')
    expect(rows[2].text()).toContain('Messages')

    wrapper.unmount()
  })

  it('computes legend percentages as the share of the window', () => {
    const wrapper = mount(ContextUsage, {
      props: { total: 200000, data },
    })

    const rows = wrapper.findAll('.pxd-context-usage--legend li')
    expect(rows[0].text()).toContain('3.5%')
    expect(rows[1].text()).toContain('1.0%')
    expect(rows[2].text()).toContain('0.5%')

    wrapper.unmount()
  })

  it('sorts segments by tokens in descending order', () => {
    const wrapper = mount(ContextUsage, {
      props: {
        total: 200000,
        data: [
          { name: 'System prompt', tokens: 1000 },
          { name: 'Messages', tokens: 7000 },
          { name: 'Tools', tokens: 2000 },
        ],
      },
    })

    const rows = wrapper.findAll('.pxd-context-usage--legend li')
    expect(rows[0].text()).toContain('Messages')
    expect(rows[1].text()).toContain('Tools')
    expect(rows[2].text()).toContain('System prompt')

    wrapper.unmount()
  })

  it('reports the used share of the window as a meter', () => {
    const wrapper = mount(ContextUsage, {
      props: { total: 200000, data },
    })

    expect(wrapper.attributes('role')).toBe('meter')
    expect(wrapper.attributes('aria-valuenow')).toBe('5')
    expect(wrapper.attributes('aria-valuetext')).toBe('5% used')

    wrapper.unmount()
  })

  it('clamps the meter value when the data exceeds the window', () => {
    const wrapper = mount(ContextUsage, {
      props: {
        total: 100,
        data: [
          { name: 'Tools', tokens: 60 },
          { name: 'Messages', tokens: 60 },
        ],
      },
    })

    expect(wrapper.attributes('aria-valuenow')).toBe('100')
    expect(wrapper.findAll('.pxd-context-usage--legend li')[0].text()).toContain('60.0%')

    wrapper.unmount()
  })

  it('renders zero percentages when nothing is used', () => {
    const wrapper = mount(ContextUsage, {
      props: {
        total: 200000,
        data: [
          { name: 'Tools', tokens: 0 },
          { name: 'Messages', tokens: 0 },
        ],
      },
    })

    expect(wrapper.attributes('aria-valuenow')).toBe('0')

    const rows = wrapper.findAll('.pxd-context-usage--legend li')
    expect(rows[0].text()).toContain('0.0%')
    expect(rows[1].text()).toContain('0.0%')

    wrapper.unmount()
  })

  it('keeps the unused window as the gray track instead of filling the whole bar', () => {
    const wrapper = mount(ContextUsage, {
      props: { total: 200000, data },
    })

    expect(wrapper.find('.pxd-context-usage--free').attributes('style')).toContain(
      'flex-grow: 190000',
    )

    wrapper.unmount()
  })

  it('collapses the free track when the data exceeds the window', () => {
    const wrapper = mount(ContextUsage, {
      props: {
        total: 100,
        data: [
          { name: 'Tools', tokens: 60 },
          { name: 'Messages', tokens: 60 },
        ],
      },
    })

    expect(wrapper.find('.pxd-context-usage--free').attributes('style')).toContain('flex-grow: 0')

    wrapper.unmount()
  })

  it('renders each segment as a progressively lighter tint of the primary color', () => {
    const wrapper = mount(ContextUsage, {
      props: { total: 200000, data },
    })

    const segments = wrapper.findAll('.pxd-context-usage--segment')
    expect(segments[0].attributes('style')).toContain(
      '--context-usage-color: color-mix(in srgb, var(--color-primary) 100%',
    )
    expect(segments[1].attributes('style')).toContain(
      '--context-usage-color: color-mix(in srgb, var(--color-primary) 90%',
    )
    expect(segments[2].attributes('style')).toContain(
      '--context-usage-color: color-mix(in srgb, var(--color-primary) 80%',
    )

    wrapper.unmount()
  })

  it('dims the other segments and rows on hover and restores on leave', async () => {
    const wrapper = mount(ContextUsage, {
      props: { total: 200000, data },
    })

    const segments = wrapper.findAll('.pxd-context-usage--segment')
    const rows = wrapper.findAll('.pxd-context-usage--legend li')

    await rows[1].trigger('pointerenter')

    expect(segments[0].attributes('style')).toContain('opacity: 0.2')
    expect(segments[1].attributes('style')).toContain('opacity: 1')
    expect(segments[1].attributes('style')).toContain(
      '--context-usage-color: color-mix(in srgb, var(--color-primary) 90%',
    )
    expect(rows[0].attributes('style')).toContain('opacity: 0.2')
    expect(rows[1].attributes('style')).toContain('opacity: 1')

    await rows[1].trigger('pointerleave')

    expect(segments[0].attributes('style')).toContain('opacity: 1')
    expect(rows[0].attributes('style')).toContain('opacity: 1')

    wrapper.unmount()
  })

  it('dims the other rows when hovering a bar segment', async () => {
    const wrapper = mount(ContextUsage, {
      props: { total: 200000, data },
    })

    await wrapper.findAll('.pxd-context-usage--segment')[2].trigger('pointerenter')

    const rows = wrapper.findAll('.pxd-context-usage--legend li')
    expect(rows[0].attributes('style')).toContain('opacity: 0.2')
    expect(rows[2].attributes('style')).toContain('opacity: 1')

    wrapper.unmount()
  })

  it('hides the legend when legend is false', () => {
    const wrapper = mount(ContextUsage, {
      props: { total: 200000, data, legend: false },
    })

    expect(wrapper.find('.pxd-context-usage--legend').exists()).toBe(false)
    expect(wrapper.findAll('.pxd-context-usage--segment').length).toBe(3)

    wrapper.unmount()
  })
})
