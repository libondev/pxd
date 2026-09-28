import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import FeedbackBar from '../../src/components/feedback-bar/index.vue'

describe('feedback-bar', () => {
  it('renders properly', () => {
    const wrapper = mount(FeedbackBar, {
      props: {
        label: 'Is this response helpful?',
      },
    })

    expect(wrapper.find('.pxd-feedback-bar').exists()).toBe(true)
    expect(wrapper.find('.pxd-feedback-bar--label').text()).toBe('Is this response helpful?')
    expect(wrapper.findAll('button')).toHaveLength(3)

    wrapper.unmount()
  })

  it('should render label', () => {
    const wrapper = mount(FeedbackBar, {
      props: {
        label: 'Was this useful?',
      },
    })

    expect(wrapper.text()).toContain('Was this useful?')

    wrapper.unmount()
  })

  it('should emit thumbUp when the thumb-up button is clicked', async () => {
    const wrapper = mount(FeedbackBar, {
      props: {
        label: 'Feedback',
      },
    })

    await wrapper.findAll('button')[0]!.trigger('click')

    expect(wrapper.emitted('thumbUp')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should emit thumbDown when the thumb-down button is clicked', async () => {
    const wrapper = mount(FeedbackBar, {
      props: {
        label: 'Feedback',
      },
    })

    await wrapper.findAll('button')[1]!.trigger('click')

    expect(wrapper.emitted('thumbDown')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should emit close when the close button is clicked', async () => {
    const wrapper = mount(FeedbackBar, {
      props: {
        label: 'Feedback',
      },
    })

    await wrapper.findAll('button')[2]!.trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should pass through attrs', () => {
    const wrapper = mount(FeedbackBar, {
      props: {
        label: 'Feedback',
      },
      attrs: {
        id: 'my-feedback-bar',
        class: 'extra-class',
      },
    })

    expect(wrapper.attributes('id')).toBe('my-feedback-bar')
    expect(wrapper.classes()).toContain('extra-class')

    wrapper.unmount()
  })
})
