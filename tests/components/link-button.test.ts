import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LinkButton from '../../src/components/link-button/index.vue'

describe('link-button', () => {
  it('should render properly', () => {
    const wrapper = mount(LinkButton, {
      props: {
        href: 'https://vuejs.org/',
        target: '_blank',
      },
    })

    const el = wrapper.element as HTMLAnchorElement

    expect(el.tagName).toBe('A')
    expect(el.href).toBe('https://vuejs.org/')
    expect(el.target).toBe('_blank')

    wrapper.unmount()
  })

  it('should render external link icon when set', () => {
    const wrapper = mount(LinkButton, {
      props: {
        href: '/',
        externalIcon: true,
      },
    })

    const children = wrapper.element.children

    expect(children.length).toBe(2)
    expect(children[1].tagName).toBe('svg')

    wrapper.unmount()
  })
})
