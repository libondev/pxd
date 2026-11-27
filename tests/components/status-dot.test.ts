import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
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

    await wrapper.setProps({ status: 'READY' })
    expect(wrapper.find('i').classes()).toContain('is-ready')

    await wrapper.setProps({ status: 'ERROR' })
    expect(wrapper.find('i').classes()).toContain('is-error')

    await wrapper.setProps({ status: 'BUILDING' })
    expect(wrapper.find('i').classes()).toContain('is-building')

    await wrapper.setProps({ status: 'CANCELED' })
    expect(wrapper.find('i').classes()).toContain('is-canceled')

    wrapper.unmount()
  })

  it('should render uppercase status text when showLabel is true', async () => {
    const wrapper = mount(StatusDot, {
      props: {
        showLabel: true,
        status: 'ERROR',
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
        status: 'READY',
      },
    })

    const labelSpan = wrapper.find('span span')
    expect(labelSpan.exists()).toBe(true)

    expect(labelSpan.text()).toBe(customLabel)

    wrapper.unmount()
  })

  it('should fall back to the status text when label is empty', () => {
    const wrapper = mount(StatusDot, {
      props: {
        label: '',
        showLabel: true,
        status: 'READY',
      },
    })

    expect(wrapper.find('span span').text()).toBe('Ready')

    wrapper.unmount()
  })

  it('should return the uppercase text when status changes', async () => {
    const wrapper = mount(StatusDot, {
      props: {
        showLabel: true,
        status: 'QUEUED',
      },
    })

    expect(wrapper.find('span span').text()).toBe('Queued')

    await wrapper.setProps({ status: 'BUILDING' })
    expect(wrapper.find('span span').text()).toBe('Building')

    wrapper.unmount()
  })
})
