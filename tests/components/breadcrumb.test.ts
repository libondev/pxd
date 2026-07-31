import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
import BreadcrumbItem from '../../src/components/breadcrumb-item/index.vue'
import Breadcrumb from '../../src/components/breadcrumb/index.vue'

function createItems() {
  return [
    h(BreadcrumbItem, { to: '/', replace: true }, () => 'Home'),
    h(BreadcrumbItem, { to: '/components' }, () => 'Components'),
    h(BreadcrumbItem, () => 'Breadcrumb'),
  ]
}

describe('breadcrumb', () => {
  it('should render semantic navigation, items, and the default separator', () => {
    const wrapper = mount(Breadcrumb, {
      slots: {
        default: createItems,
      },
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })

    expect(wrapper.attributes('aria-label')).toBe('breadcrumb')
    expect(wrapper.findAll('.pxd-breadcrumb-item')).toHaveLength(3)
    expect(wrapper.findAll('.pxd-breadcrumb-item--separator')).toHaveLength(3)
    expect(wrapper.find('.pxd-breadcrumb-item--separator').text()).toBe('/')
    expect(wrapper.find('.pxd-breadcrumb-item').classes()).toContain(
      'last:[&_.pxd-breadcrumb-item--separator]:hidden',
    )

    wrapper.unmount()
  })

  it('should render a custom separator', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        separator: '>',
      },
      slots: {
        default: createItems,
      },
    })

    expect(wrapper.findAll('.pxd-breadcrumb-item--separator')[0]?.text()).toBe('>')

    wrapper.unmount()
  })

  it('should prefer separator icon over separator text', () => {
    const SeparatorIcon = defineComponent({
      setup() {
        return () => h('svg', { 'data-test': 'separator-icon' })
      },
    })
    const wrapper = mount(Breadcrumb, {
      props: {
        separator: '>',
        separatorIcon: SeparatorIcon,
      },
      slots: {
        default: createItems,
      },
    })

    expect(wrapper.findAll('[data-test="separator-icon"]')).toHaveLength(3)
    expect(wrapper.find('.pxd-breadcrumb-item--separator').text()).toBe('')

    wrapper.unmount()
  })

  it('should pass navigation props to RouterLink', () => {
    const RouterLinkReplaceStub = defineComponent({
      props: {
        to: {
          type: [String, Object],
          required: true,
        },
        replace: Boolean,
      },
      setup(_, { slots }) {
        return () => h('a', slots.default?.())
      },
    })
    const wrapper = mount(Breadcrumb, {
      slots: {
        default: createItems,
      },
      global: {
        stubs: {
          RouterLink: RouterLinkReplaceStub,
        },
      },
    })
    const links = wrapper.findAllComponents(RouterLinkReplaceStub)

    expect(links).toHaveLength(2)
    expect(links[0]?.props()).toMatchObject({
      to: '/',
      replace: true,
    })
    expect(links[1]?.props('to')).toBe('/components')

    wrapper.unmount()
  })
})
