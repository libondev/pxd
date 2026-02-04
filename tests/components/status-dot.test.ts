import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import StatusDot from '../../src/components/status-dot/index.vue'

describe('status-dot', () => {
  it('should render default state', () => {
    const wrapper = mount(StatusDot)

    expect(wrapper.find('.pxd-state-dot').exists()).toBe(true)
    expect(wrapper.find('i').exists()).toBe(true)

    // default state is QUEUED
    expect(wrapper.find('i').classes()).toContain('is-queued')

    expect(wrapper.find('span span').exists()).toBe(false)

    wrapper.unmount()
  })

  it('should render different colors for different states', async () => {
    const wrapper = mount(StatusDot)

    await wrapper.setProps({ state: 'READY' })
    expect(wrapper.find('i').classes()).toContain('is-ready')

    await wrapper.setProps({ state: 'ERROR' })
    expect(wrapper.find('i').classes()).toContain('is-error')

    await wrapper.setProps({ state: 'BUILDING' })
    expect(wrapper.find('i').classes()).toContain('is-building')

    await wrapper.setProps({ state: 'CANCELED' })
    expect(wrapper.find('i').classes()).toContain('is-canceled')

    wrapper.unmount()
  })

  it('should render uppercase state text when label is true', async () => {
    const wrapper = mount(StatusDot, {
      props: {
        label: true,
        state: 'ERROR',
      },
    })

    const labelSpan = wrapper.find('span span')
    expect(labelSpan.exists()).toBe(true)

    expect(labelSpan.text()).toBe('Error')

    wrapper.unmount()
  })

  it('should render the provided string when label is a string', async () => {
    const customLabel = 'custom label'
    const wrapper = mount(StatusDot, {
      props: {
        label: customLabel,
        state: 'READY',
      },
    })

    const labelSpan = wrapper.find('span span')
    expect(labelSpan.exists()).toBe(true)

    expect(labelSpan.text()).toBe(customLabel)

    wrapper.unmount()
  })

  it('should return the uppercase text when state changes', async () => {
    const wrapper = mount(StatusDot, {
      props: {
        label: true,
        state: 'QUEUED',
      },
    })

    expect(wrapper.find('span span').text()).toBe('Queued')

    await wrapper.setProps({ state: 'BUILDING' })
    expect(wrapper.find('span span').text()).toBe('Building')

    wrapper.unmount()
  })
})
