import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
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

  it('renders text when only a prefix slot is provided', () => {
    const wrapper = mount(LinkButton, {
      props: {
        href: '/',
        text: 'New chat',
      },
      slots: {
        prefix: '<span data-icon>+</span>',
      },
    })

    expect(wrapper.text()).toBe('+New chat')

    wrapper.unmount()
  })

  it('prefers the default slot over text', () => {
    const wrapper = mount(LinkButton, {
      props: {
        href: '/',
        text: 'New chat',
      },
      slots: {
        default: 'Slot label',
      },
    })

    expect(wrapper.text()).toBe('Slot label')

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

  it('renders a plain anchor for internal paths without a router', () => {
    const wrapper = mount(LinkButton, {
      props: {
        href: '/settings',
      },
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/settings')

    wrapper.unmount()
  })

  it('renders a router-link when the host registers one', () => {
    const RouterLink = defineComponent({
      props: {
        to: String,
      },
      setup: (linkProps) => () => h('a', { 'data-router-link': '', href: linkProps.to }),
    })

    const wrapper = mount(LinkButton, {
      props: {
        href: '/settings',
      },
      global: {
        components: {
          RouterLink,
        },
      },
    })

    expect(wrapper.find('[data-router-link]').attributes('href')).toBe('/settings')

    wrapper.unmount()
  })

  it('falls back to a plain button with a safe type when href is empty', () => {
    const wrapper = mount(LinkButton, {
      props: {
        href: '',
      },
    })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')

    wrapper.unmount()
  })
})
