import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { createSSRApp, defineComponent, h, KeepAlive, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import ConfigProvider from '../../src/components/config-provider/index.vue'
import TimeAgo from '../../src/components/time-ago/index.vue'
import zhCN from '../../src/locales/zh-cn.js'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

function useFrozenClock() {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
}

function showPage() {
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('time-ago', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders properly', () => {
    const wrapper = mount(TimeAgo, { props: { value: Date.now() } })

    expect(wrapper.find('[data-time-ago]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render now for a value under a minute old', () => {
    const wrapper = mount(TimeAgo, { props: { value: Date.now() - 30 * SECOND } })

    expect(wrapper.text()).toBe('just now')

    wrapper.unmount()
  })

  it('should render the singular unit for a count of one', () => {
    const wrapper = mount(TimeAgo, { props: { value: Date.now() - MINUTE } })

    expect(wrapper.text()).toBe('1 minute ago')

    wrapper.unmount()
  })

  it('should render hours, days and years on their own boundaries', () => {
    const values = [
      { value: Date.now() - 5 * HOUR, text: '5 hours ago' },
      { value: Date.now() - 10 * DAY, text: '10 days ago' },
      { value: Date.now() - 400 * DAY, text: '1 year ago' },
    ]

    values.forEach(({ value, text }) => {
      const wrapper = mount(TimeAgo, { props: { value } })

      expect(wrapper.text()).toBe(text)

      wrapper.unmount()
    })
  })

  it('should render a Date object', () => {
    const wrapper = mount(TimeAgo, { props: { value: new Date(Date.now() - 2 * HOUR) } })

    expect(wrapper.text()).toBe('2 hours ago')

    wrapper.unmount()
  })

  it('should render the future direction for a value ahead of now', () => {
    useFrozenClock()

    const wrapper = mount(TimeAgo, { props: { value: Date.now() + 3 * HOUR } })

    expect(wrapper.text()).toBe('in 3 hours')

    wrapper.unmount()
  })

  it('should substitute the template of the configured locale', () => {
    useFrozenClock()

    const host = defineComponent({
      setup() {
        return () =>
          h(
            ConfigProvider,
            { locale: zhCN },
            { default: () => h(TimeAgo, { value: Date.now() - 3 * HOUR }) },
          )
      },
    })

    const wrapper = mount(host)

    expect(wrapper.text()).toBe('3小时前')

    wrapper.unmount()
  })

  it('should render the invalid label and no datetime for an unparseable value', () => {
    useFrozenClock()

    const wrapper = mount(TimeAgo, { props: { value: 'not-a-date' } })

    expect(wrapper.text()).toBe('Invalid date')
    expect(wrapper.find('[data-time-ago]').attributes('datetime')).toBeUndefined()
    expect(vi.getTimerCount()).toBe(0)

    wrapper.unmount()
  })

  it('should update the text at the moment the label changes', async () => {
    useFrozenClock()

    const wrapper = mount(TimeAgo, { props: { value: Date.now() - 59 * SECOND } })

    expect(wrapper.text()).toBe('just now')

    vi.advanceTimersByTime(SECOND)
    await nextTick()

    expect(wrapper.text()).toBe('1 minute ago')

    wrapper.unmount()
  })

  it('should not wake on the minute for an hour-level value', async () => {
    useFrozenClock()

    const wrapper = mount(TimeAgo, { props: { value: Date.now() - 5 * HOUR - 30 * MINUTE } })

    expect(wrapper.text()).toBe('5 hours ago')

    vi.advanceTimersByTime(MINUTE)
    await nextTick()

    expect(wrapper.text()).toBe('5 hours ago')

    vi.advanceTimersByTime(29 * MINUTE)
    await nextTick()

    expect(wrapper.text()).toBe('6 hours ago')

    wrapper.unmount()
  })

  it('should schedule an update that lands within the day level', async () => {
    useFrozenClock()

    const wrapper = mount(TimeAgo, { props: { value: Date.now() - 10 * DAY } })

    expect(wrapper.text()).toBe('10 days ago')

    vi.advanceTimersByTime(DAY)
    await nextTick()

    expect(wrapper.text()).toBe('11 days ago')

    wrapper.unmount()
  })

  it('should not schedule a timer beyond the day level', () => {
    useFrozenClock()

    const wrapper = mount(TimeAgo, { props: { value: Date.now() - 40 * DAY } })

    expect(wrapper.text()).toBe('1 month ago')
    expect(vi.getTimerCount()).toBe(0)

    wrapper.unmount()
  })

  it('should resync when the page becomes visible again', async () => {
    useFrozenClock()

    const wrapper = mount(TimeAgo, { props: { value: Date.now() - 5 * MINUTE } })

    expect(wrapper.text()).toBe('5 minutes ago')

    // 页面隐藏期间定时器不保证触发，回到前台要立刻补算。
    vi.setSystemTime(new Date('2026-01-01T00:30:00Z'))
    showPage()
    await nextTick()

    expect(wrapper.text()).toBe('35 minutes ago')

    wrapper.unmount()
  })

  it('should stop refreshing while cached and resync when activated again', async () => {
    useFrozenClock()

    const value = Date.now() - 5 * MINUTE
    const active = ref(true)
    const host = defineComponent({
      setup() {
        return () => h(KeepAlive, null, [active.value ? h(TimeAgo, { value }) : null])
      },
    })

    const wrapper = mount(host)

    expect(wrapper.text()).toBe('5 minutes ago')
    expect(vi.getTimerCount()).toBe(1)

    active.value = false
    await nextTick()

    expect(vi.getTimerCount()).toBe(0)

    // 缓存期间时钟推进，重新激活要立刻补算。
    vi.setSystemTime(new Date('2026-01-01T00:30:00Z'))

    active.value = true
    await nextTick()

    expect(wrapper.text()).toBe('35 minutes ago')

    wrapper.unmount()
  })

  it('should realign the schedule when the value changes', async () => {
    useFrozenClock()

    const wrapper = mount(TimeAgo, { props: { value: Date.now() - 40 * DAY } })

    await wrapper.setProps({ value: Date.now() - 59 * SECOND })
    vi.advanceTimersByTime(SECOND)
    await nextTick()

    expect(wrapper.text()).toBe('1 minute ago')

    wrapper.unmount()
  })

  it('should start refreshing when refresh becomes true', async () => {
    useFrozenClock()

    const wrapper = mount(TimeAgo, {
      props: { value: Date.now() - 59 * SECOND, refresh: false },
    })

    await wrapper.setProps({ refresh: true })
    vi.advanceTimersByTime(SECOND)
    await nextTick()

    expect(wrapper.text()).toBe('1 minute ago')

    wrapper.unmount()
  })

  it('should stop refreshing when refresh becomes false', async () => {
    useFrozenClock()

    const wrapper = mount(TimeAgo, { props: { value: Date.now() - 59 * SECOND } })

    vi.advanceTimersByTime(SECOND)
    await nextTick()

    await wrapper.setProps({ refresh: false })
    vi.advanceTimersByTime(10 * MINUTE)
    await nextTick()

    expect(wrapper.text()).toBe('1 minute ago')

    wrapper.unmount()
  })

  it('should keep the text frozen when refresh is false', async () => {
    useFrozenClock()

    const wrapper = mount(TimeAgo, { props: { value: Date.now(), refresh: false } })

    expect(vi.getTimerCount()).toBe(0)

    vi.setSystemTime(new Date('2026-01-01T01:00:00Z'))
    showPage()
    await nextTick()

    expect(wrapper.text()).toBe('just now')

    wrapper.unmount()
  })

  it('should hydrate the server label without a mismatch warning', async () => {
    useFrozenClock()

    const value = Date.now() - 5 * MINUTE
    const html = await renderToString(createSSRApp(TimeAgo, { value }))

    expect(html).toContain('data-allow-mismatch="text"')
    expect(html).toContain('5 minutes ago')

    // 客户端时钟比服务端晚两小时，水合时算出的文案必然不同。
    vi.setSystemTime(new Date('2026-01-01T02:00:00Z'))

    const container = document.createElement('div')
    container.innerHTML = html
    document.body.appendChild(container)

    const warnSpy = vi.spyOn(console, 'warn')
    const app = createSSRApp(TimeAgo, { value })

    app.mount(container)

    expect(container.textContent).toBe('2 hours ago')
    expect(
      warnSpy.mock.calls.map((call) => String(call[0])).filter((m) => m.includes('Hydration')),
    ).toEqual([])

    app.unmount()
    container.remove()
  })

  it('should stop refreshing after unmount', () => {
    useFrozenClock()

    const wrapper = mount(TimeAgo, { props: { value: Date.now() } })

    wrapper.unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})
