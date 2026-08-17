import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, Fragment, h, markRaw } from 'vue'
import TimelineItem from '../../src/components/timeline-item/index.vue'
import Timeline from '../../src/components/timeline/index.vue'

describe('timeline', () => {
  it('renders semantic timeline elements', () => {
    const wrapper = mount(Timeline, {
      slots: {
        default: () => h(TimelineItem, null, () => 'Event'),
      },
    })

    expect(wrapper.element.tagName).toBe('UL')
    expect(wrapper.find('.pxd-timeline-item').element.tagName).toBe('LI')
    expect(wrapper.text()).toContain('Event')

    wrapper.unmount()
  })

  it('merges classes onto timeline roots', () => {
    const wrapper = mount(Timeline, {
      attrs: { class: 'custom-timeline' },
      slots: {
        default: () => h(TimelineItem, { class: 'custom-timeline-item' }),
      },
    })

    expect(wrapper.classes()).toContain('custom-timeline')
    expect(wrapper.find('.pxd-timeline-item').classes()).toContain('custom-timeline-item')

    wrapper.unmount()
  })

  it.each(['start', 'alternate', 'alternate-reverse', 'end', 'horizontal'] as const)(
    'supports %s mode',
    (mode) => {
      const wrapper = mount(Timeline, {
        props: { mode },
      })

      expect(wrapper.classes()).toContain(`is-${mode}`)

      wrapper.unmount()
    },
  )

  it('reverses the rendered item order', () => {
    const wrapper = mount(Timeline, {
      props: { reverse: true },
      slots: {
        default: () => [
          h(TimelineItem, null, () => 'First'),
          h(TimelineItem, null, () => 'Second'),
        ],
      },
    })

    expect(wrapper.findAll('.pxd-timeline-item').map((item) => item.text())).toEqual([
      'Second',
      'First',
    ])

    wrapper.unmount()
  })

  it('reverses items wrapped in a fragment', () => {
    const wrapper = mount(Timeline, {
      props: { reverse: true },
      slots: {
        default: () =>
          h(Fragment, null, [
            h(TimelineItem, null, () => 'First'),
            h(TimelineItem, null, () => 'Second'),
          ]),
      },
    })

    expect(wrapper.findAll('.pxd-timeline-item').map((item) => item.text())).toEqual([
      'Second',
      'First',
    ])

    wrapper.unmount()
  })
})

describe('timeline-item', () => {
  it('renders timestamp at the configured placement', async () => {
    const wrapper = mount(TimelineItem, {
      props: { timestamp: '2026-08-03' },
      slots: { default: 'Released' },
    })

    expect(wrapper.find('.pxd-timeline-item--content + .is-bottom').text()).toBe('2026-08-03')

    await wrapper.setProps({ placement: 'top' })

    expect(wrapper.find('.is-top + .pxd-timeline-item--content').exists()).toBe(true)
    expect(wrapper.find('.is-top').text()).toBe('2026-08-03')

    wrapper.unmount()
  })

  it('hides timestamp when requested', () => {
    const wrapper = mount(TimelineItem, {
      props: {
        timestamp: '2026-08-03',
        hideTimestamp: true,
      },
    })

    expect(wrapper.find('.pxd-timeline-item--timestamp').exists()).toBe(false)

    wrapper.unmount()
  })

  it('styles the default node with its props', () => {
    const wrapper = mount(TimelineItem, {
      props: {
        color: 'rgb(1, 2, 3)',
        hollow: true,
        size: 'large',
        type: 'success',
      },
    })
    const node = wrapper.find('.pxd-timeline-item--node')

    expect(node.classes()).toEqual(expect.arrayContaining(['is-large', 'is-success', 'is-hollow']))
    expect(node.attributes('style')).toContain('rgb(1, 2, 3)')

    wrapper.unmount()
  })

  it('renders icon and custom dot nodes', () => {
    const Icon = defineComponent({
      render: () => h('span', { class: 'custom-icon' }),
    })
    const iconWrapper = mount(TimelineItem, {
      props: { icon: markRaw(Icon) },
    })

    expect(iconWrapper.find('.custom-icon').exists()).toBe(true)
    iconWrapper.unmount()

    const dotWrapper = mount(TimelineItem, {
      slots: {
        dot: '<span class="custom-dot" />',
      },
    })

    expect(dotWrapper.find('.pxd-timeline-item--node').exists()).toBe(false)
    expect(dotWrapper.find('.custom-dot').exists()).toBe(true)

    dotWrapper.unmount()
  })
})
