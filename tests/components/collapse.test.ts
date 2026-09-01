import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import Collapse from '../../src/components/collapse/index.vue'

describe('collapse', () => {
  it('renders properly', () => {
    const wrapper = mount(Collapse)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render title', () => {
    const wrapper = mount(Collapse, {
      props: {
        title: 'Click to expand',
      },
    })

    expect(wrapper.text()).toContain('Click to expand')

    wrapper.unmount()
  })

  it('should emit toggle event on click', async () => {
    const wrapper = mount(Collapse, {
      props: {
        title: 'Toggle me',
      },
    })

    await wrapper.find('summary').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('toggle')

    wrapper.unmount()
  })

  it('should keep collapsed slot content in the document', () => {
    const wrapper = mount(Collapse, {
      slots: {
        default: '<p>Hidden content</p>',
      },
    })

    expect(wrapper.text()).toContain('Hidden content')
    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(false)

    wrapper.unmount()
  })

  it('should open when expand is true', () => {
    const wrapper = mount(Collapse, {
      props: {
        expand: true,
        title: 'Already open',
      },
    })

    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(true)

    wrapper.unmount()
  })

  it('should open on trigger click', async () => {
    const wrapper = mount(Collapse, {
      props: {
        title: 'Toggle me',
      },
      slots: {
        default: '<p>Panel body</p>',
      },
    })

    await wrapper.find('summary').trigger('click')
    await nextTick()

    expect((wrapper.find('details').element as HTMLDetailsElement).open).toBe(true)

    wrapper.unmount()
  })

  it('should expand when details is opened by the browser', async () => {
    const wrapper = mount(Collapse, {
      props: {
        title: 'Find me',
      },
      slots: {
        default: '<p>Searchable body</p>',
      },
    })

    const details = wrapper.find('details')
    const detailsEl = details.element as HTMLDetailsElement

    detailsEl.open = true
    await details.trigger('toggle')
    await nextTick()

    expect(detailsEl.open).toBe(true)

    wrapper.unmount()
  })
})
