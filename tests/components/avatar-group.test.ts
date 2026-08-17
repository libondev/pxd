import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import AvatarGroup from '../../src/components/avatar-group/index.vue'

const avatarSrc = 'https://example.com/avatar.jpg'

describe('avatar-group', () => {
  it('renders properly', async () => {
    const wrapper = mount(AvatarGroup, {
      props: {
        max: 1,
        options: [{ src: avatarSrc }, { src: avatarSrc }],
      },
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(avatarSrc)
    expect(wrapper.text()).toContain('+1')

    wrapper.unmount()
  })

  it('should render all options when they fit within max', () => {
    const wrapper = mount(AvatarGroup, {
      props: {
        max: 3,
        options: [
          { src: avatarSrc, alt: 'A' },
          { src: avatarSrc, alt: 'B' },
        ],
      },
    })

    const imgs = wrapper.findAll('img')
    expect(imgs).toHaveLength(2)
    expect(imgs[0].attributes('alt')).toBe('A')
    expect(imgs[1].attributes('alt')).toBe('B')
    expect(wrapper.text()).not.toContain('+')

    wrapper.unmount()
  })

  it('should clamp options to max and show the overflow count', () => {
    const wrapper = mount(AvatarGroup, {
      props: {
        max: 2,
        options: [{ src: avatarSrc }, { src: avatarSrc }, { src: avatarSrc }, { src: avatarSrc }],
      },
    })

    expect(wrapper.findAll('img')).toHaveLength(2)
    expect(wrapper.text()).toContain('+2')

    wrapper.unmount()
  })

  it('should pass the group size to avatars', () => {
    const wrapper = mount(AvatarGroup, {
      props: {
        size: 40,
        options: [{ src: avatarSrc }],
      },
    })

    expect(wrapper.find('.pxd-avatar').attributes('style')).toContain('--avatar-size: 40px')

    wrapper.unmount()
  })
})
