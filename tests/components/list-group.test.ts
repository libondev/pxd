import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { computed, defineComponent, h, ref } from 'vue'
import ListGroup from '../../src/components/list-group/index.vue'
import { provideListFilterContext } from '../../src/contexts/list'

function mountWithFilter(groupVisible: boolean, searchValue: string) {
  const provider = defineComponent({
    setup(_, { slots }) {
      provideListFilterContext({
        searchValue: ref(searchValue),
        visibleCount: computed(() => 0),
        isItemVisible: () => true,
        isGroupVisible: () => groupVisible,
        registerItem: () => {},
        unregisterItem: () => {},
      })

      return () => slots.default?.()
    },
  })

  return mount(provider, {
    slots: {
      default: () => h(ListGroup, { label: 'Group' }, () => h('div', 'Item')),
    },
  })
}

describe('list-group', () => {
  it('renders properly', () => {
    const wrapper = mount(ListGroup, {
      props: {
        label: 'Group',
      },
      slots: {
        default: '<div>Item</div>',
      },
    })

    expect(wrapper.find('.pxd-list-group').exists()).toBe(true)
    expect(wrapper.text()).toContain('Group')
    expect(wrapper.text()).toContain('Item')

    wrapper.unmount()
  })

  it('should render the label slot over the label prop', () => {
    const wrapper = mount(ListGroup, {
      props: {
        label: 'Prop Label',
      },
      slots: {
        label: 'Slot Label',
      },
    })

    expect(wrapper.text()).toContain('Slot Label')

    wrapper.unmount()
  })

  it('should hide the group when the filter search does not match', () => {
    const wrapper = mountWithFilter(false, 'query')

    expect(wrapper.find('.pxd-list-group').attributes('hidden')).toBeDefined()

    wrapper.unmount()
  })

  it('should keep the group visible when the filter search matches', () => {
    const wrapper = mountWithFilter(true, 'query')

    expect(wrapper.find('.pxd-list-group').attributes('hidden')).toBeUndefined()

    wrapper.unmount()
  })

  it('should not be hidden without a filter context', () => {
    const wrapper = mount(ListGroup)

    expect(wrapper.find('.pxd-list-group').attributes('hidden')).toBeUndefined()

    wrapper.unmount()
  })

  it('should pass through attrs', () => {
    const wrapper = mount(ListGroup, {
      attrs: {
        id: 'my-group',
      },
    })

    expect(wrapper.find('.pxd-list-group').attributes('id')).toBe('my-group')
    expect(wrapper.find('.pxd-list-group').attributes('role')).toBe('presentation')

    wrapper.unmount()
  })
})
