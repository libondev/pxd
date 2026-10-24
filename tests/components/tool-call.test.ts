import CheckCircleIcon from '@gdsicon/vue/check-circle'
import ClockIcon from '@gdsicon/vue/clock'
import CrossCircleIcon from '@gdsicon/vue/cross-circle'
import LoaderCircleIcon from '@gdsicon/vue/loader-circle'
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
    expect(wrapper.findComponent(ClockIcon).exists()).toBe(true)
    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(true)

    wrapper.unmount()
  })

  it('renders status icons', async () => {
    const wrapper = mount(ToolCall, {
      props: { name: 'lookup_weather', status: 'completed' },
    })

    expect(wrapper.findComponent(CheckCircleIcon).exists()).toBe(true)

    await wrapper.setProps({ status: 'running' })
    expect(wrapper.findComponent(LoaderCircleIcon).exists()).toBe(true)
    expect(wrapper.findComponent(LoaderCircleIcon).classes()).toContain('motion-safe:animate-spin')

    await wrapper.setProps({ status: 'error' })
    expect(wrapper.findComponent(CrossCircleIcon).exists()).toBe(true)

    await wrapper.setProps({ status: 'pending' })
    expect(wrapper.findComponent(ClockIcon).exists()).toBe(true)

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

  it('renders content-block arrays as plain text without JSON highlighting', () => {
    const wrapper = mount(ToolCall, {
      props: {
        name: 'bash',
        status: 'completed',
        input: { command: 'pnpm test', timeout: 30000 },
        output: [{ type: 'text', text: '$ pnpm test\n ✓ 8 tests passed\n Done in 2.14s' }],
      },
    })

    const codes = wrapper.findAll('.pxd-tool-call--code')

    expect(codes).toHaveLength(2)
    expect(codes[1]!.text()).toContain('$ pnpm test')
    expect(codes[1]!.text()).toContain('Done in 2.14s')
    expect(codes[1]!.text()).not.toContain('"type"')
    expect(wrapper.findAll('code')[0]!.classes()).toContain('language-json')
    expect(wrapper.findAll('code')[1]!.classes()).not.toContain('language-json')

    wrapper.unmount()
  })

  it('marks image blocks with a placeholder instead of dumping base64', () => {
    const wrapper = mount(ToolCall, {
      props: {
        name: 'screenshot',
        status: 'completed',
        output: [
          { type: 'text', text: 'captured 800x600' },
          { type: 'image', data: 'iVBORw0KGgo=', mimeType: 'image/png' },
        ],
      },
    })

    const text = wrapper.find('.pxd-tool-call--code').text()

    expect(text).toContain('captured 800x600')
    expect(text).toContain('[image]')
    expect(text).not.toContain('iVBORw0KGgo')

    wrapper.unmount()
  })

  it('falls back to JSON for arrays that are not content blocks', () => {
    const wrapper = mount(ToolCall, {
      props: { name: 'list', output: [{ path: 'src/a.ts' }] },
    })

    expect(wrapper.find('.pxd-tool-call--code').text()).toContain('"path"')

    wrapper.unmount()
  })

  it('applies the expand command from outside', async () => {
    const wrapper = mount(ToolCall, {
      props: { name: 'search_flights', expand: false },
    })

    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(false)

    await wrapper.setProps({ expand: true })
    await nextTick()

    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(true)

    await wrapper.find('summary').trigger('click')
    await nextTick()

    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(false)

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
