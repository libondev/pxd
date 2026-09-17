import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import ToolCall from '../../src/components/tool-call/index.vue'

describe('tool-call', () => {
  it('renders name and defaults to pending', () => {
    const wrapper = mount(ToolCall, {
      props: { name: 'search_flights' },
    })

    expect(wrapper.find('.pxd-tool-call--name').text()).toBe('search_flights')
    expect(wrapper.find('.pxd-tool-call--status').text()).toBe('Pending')
    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(true)

    wrapper.unmount()
  })

  it('renders status labels', async () => {
    const wrapper = mount(ToolCall, {
      props: { name: 'lookup_weather', status: 'completed' },
    })

    expect(wrapper.find('.pxd-tool-call--status').text()).toBe('Completed')

    await wrapper.setProps({ status: 'running' })
    expect(wrapper.find('.pxd-tool-call--status').text()).toBe('Running')

    await wrapper.setProps({ status: 'error' })
    expect(wrapper.find('.pxd-tool-call--status').text()).toBe('Error')

    wrapper.unmount()
  })

  it('pretty-prints object input and output', () => {
    const wrapper = mount(ToolCall, {
      props: {
        name: 'search_flights',
        status: 'completed',
        input: { origin: 'LHR', destination: 'SFO' },
        output: { route: 'LHR -> SFO', stops: 0 },
      },
    })

    const codes = wrapper.findAll('.pxd-tool-call--code')

    expect(codes).toHaveLength(2)
    expect(codes[0].text()).toContain('"origin":')
    expect(codes[0].text()).toContain('"LHR"')
    expect(codes[1].text()).toContain('"stops":')
    expect(codes[1].text()).toContain('0')

    wrapper.unmount()
  })

  it('pretty-prints JSON string payloads', () => {
    const wrapper = mount(ToolCall, {
      props: {
        name: 'echo',
        input: '{"ok":true}',
      },
    })

    expect(wrapper.find('.pxd-tool-call--code').text()).toContain('"ok":')
    expect(wrapper.find('.pxd-tool-call--code').text()).toContain('true')

    wrapper.unmount()
  })

  it('hides input and output when omitted', () => {
    const wrapper = mount(ToolCall, {
      props: { name: 'noop' },
    })

    expect(wrapper.findAll('.pxd-tool-call--section')).toHaveLength(0)
    expect(wrapper.findAll('.pxd-tool-call--code')).toHaveLength(0)

    wrapper.unmount()
  })

  it('keeps plain string payloads as-is when not JSON', () => {
    const wrapper = mount(ToolCall, {
      props: {
        name: 'log',
        output: 'not-json',
      },
    })

    expect(wrapper.find('.pxd-tool-call--code').text()).toBe('not-json')

    wrapper.unmount()
  })

  it('toggles open state on trigger click', async () => {
    const wrapper = mount(ToolCall, {
      props: {
        name: 'search_flights',
        input: { q: 1 },
      },
    })

    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(true)

    await wrapper.find('summary').trigger('click')
    await nextTick()

    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(false)

    await wrapper.find('summary').trigger('click')
    await nextTick()

    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(true)

    wrapper.unmount()
  })
})
