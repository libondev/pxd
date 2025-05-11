import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AvatarGroup from '../../src/components/avatar-group/index.vue'

const avatarSrc = 'https://example.com/avatar.jpg'

describe('avatar-group', () => {
  it('renders properly', async () => {
    const wrapper = mount(AvatarGroup, {
      props: {
        max: 1,
        options: [
          { src: avatarSrc },
          { src: avatarSrc },
        ],
      },
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(avatarSrc)
    expect(wrapper.html()).toContain('+1')

    wrapper.unmount()
  })
})
