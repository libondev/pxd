import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
import ConfigProvider from '../../src/components/config-provider/index.vue'
import { useConfigProvider } from '../../src/contexts/config-provider'

const LocaleConsumer = defineComponent({
  setup() {
    const configProvider = useConfigProvider()

    return () =>
      h('span', `${configProvider.locale.confirm.cancel}|${configProvider.locale.date.now}`)
  },
})

describe('config-provider', () => {
  it('should render properly', () => {
    const wrapper = mount(ConfigProvider)

    expect(wrapper.html()).toMatchInlineSnapshot(
      `"<div class="pxd-config-provider h-inherit"></div>"`,
    )

    wrapper.unmount()
  })

  it('merges partial locale values and updates when locale changes', async () => {
    const wrapper = mount(ConfigProvider, {
      props: {
        locale: {
          confirm: {
            cancel: 'Close',
          },
        },
      },
      slots: {
        default: () => h(LocaleConsumer),
      },
    })

    expect(wrapper.find('span').text()).toBe('Close|Now')

    await wrapper.setProps({
      locale: {
        date: {
          now: 'Current time',
        },
      },
    })

    expect(wrapper.find('span').text()).toBe('Cancel|Current time')

    wrapper.unmount()
  })
})
