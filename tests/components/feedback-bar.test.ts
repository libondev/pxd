import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ConfigProvider from '../../src/components/config-provider/index.vue'
import FeedbackBar from '../../src/components/feedback-bar/index.vue'
import zhCN from '../../src/locales/zh-cn.js'

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

    expect(wrapper.emitted('thumb-up')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should emit thumbDown when the thumb-down button is clicked', async () => {
    const wrapper = mount(FeedbackBar, {
      props: {
        label: 'Feedback',
      },
    })

    await wrapper.findAll('button')[1]!.trigger('click')

    expect(wrapper.emitted('thumb-down')).toHaveLength(1)

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

  it('should give each action button a distinct accessible name', () => {
    const wrapper = mount(FeedbackBar, {
      props: {
        label: 'Feedback',
      },
    })

    const labels = wrapper.findAll('button').map((button) => button.attributes('aria-label'))

    expect(labels).toEqual(['Thumb up', 'Thumb down', 'Dismiss'])
    expect(new Set(labels).size).toBe(3)

    wrapper.unmount()
  })

  it('should use the configured locale for action button labels', () => {
    const wrapper = mount({
      components: { FeedbackBar, ConfigProvider },
      setup: () => ({ locale: zhCN }),
      template: `
        <ConfigProvider :locale="locale">
          <FeedbackBar label="反馈" />
        </ConfigProvider>
      `,
    })

    const labels = wrapper.findAll('button').map((button) => button.attributes('aria-label'))

    expect(labels).toEqual(['点赞', '点踩', '关闭'])

    wrapper.unmount()
  })
  it('should hide the decorative info icon from assistive technology', () => {
    const wrapper = mount(FeedbackBar, {
      props: {
        label: 'Feedback',
      },
    })

    expect(wrapper.find('.pxd-feedback-bar > svg').attributes('aria-hidden')).toBe('true')

    wrapper.unmount()
  })
})
