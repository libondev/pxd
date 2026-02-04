import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Avatar from '../../src/components/avatar/index.vue'

const avatarSrc = 'https://example.com/avatar.jpg'

describe('avatar', () => {
  it('renders properly', async () => {
    const wrapper = mount(Avatar, {
      props: {
        src: avatarSrc,
      },
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(avatarSrc)

    wrapper.unmount()
  })

  it('handles image load error', async () => {
    const wrapper = mount(Avatar, {
      props: {
        src: 'invalid-url.jpg',
      },
    })

    const img = wrapper.find('img')
    await img.trigger('error')

    expect(wrapper.vm.getLoadingStatus()).toBe('error')
    expect(wrapper.emitted('error')).toBeTruthy()

    // 图片加载失败的时候隐藏裂开的图
    expect(wrapper.find('img').exists()).toBe(false)

    wrapper.unmount()
  })
})
