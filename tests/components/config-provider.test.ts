import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ConfigProvider from '../../src/components/config-provider/index.vue'

describe('config-provider', () => {
  it('should render properly', () => {
    const wrapper = mount(ConfigProvider)

    expect(wrapper.html()).toMatchInlineSnapshot(
      `"<div class="pxd-config-provider h-inherit"></div>"`,
    )

    wrapper.unmount()
  })
})
