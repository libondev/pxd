import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ImageGenerate from '../../src/components/image-generate/index.vue'

describe('image-generate', () => {
  it('starts empty with a generate action', () => {
    const wrapper = mount(ImageGenerate, {
      slots: { placeholder: '<span data-placeholder>Empty frame</span>' },
    })
    const root = wrapper.find('[data-image-generate]')

    expect(root.attributes('data-status')).toBe('idle')
    expect(root.attributes('data-has-image')).toBeUndefined()
    expect(wrapper.find('[data-placeholder]').text()).toBe('Empty frame')
    expect(wrapper.find('[data-image-generate-print]').exists()).toBe(false)
    expect(wrapper.find('button').text()).toBe('Generate')

    wrapper.unmount()
  })

  it('emits generate from the action button', async () => {
    const wrapper = mount(ImageGenerate)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('generate')).toHaveLength(1)

    wrapper.unmount()
  })

  it('does not emit while disabled', async () => {
    const wrapper = mount(ImageGenerate, { props: { disabled: true } })

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('generate')).toBeUndefined()

    wrapper.unmount()
  })

  it('derives the done state from a source image', () => {
    const wrapper = mount(ImageGenerate, {
      props: { src: 'generated.png', alt: 'A generated landscape' },
    })
    const root = wrapper.find('[data-image-generate]')
    const image = wrapper.find('[data-image-generate-print]')

    expect(root.attributes('data-status')).toBe('done')
    expect(root.attributes('data-has-image')).toBe('true')
    expect(image.attributes('src')).toBe('generated.png')
    expect(image.attributes('alt')).toBe('A generated landscape')
    expect(wrapper.find('button').text()).toBe('Regenerate')

    wrapper.unmount()
  })

  it('shows a concrete generation progress', () => {
    const wrapper = mount(ImageGenerate, {
      props: {
        src: 'previous.png',
        status: 'generating',
        progress: 42,
      },
    })
    const root = wrapper.find('[data-image-generate]')
    const progress = wrapper.find('[role="progressbar"]')

    expect(root.attributes('data-status')).toBe('generating')
    expect(root.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('button').exists()).toBe(false)
    expect(progress.attributes('aria-valuemin')).toBe('0')
    expect(progress.attributes('aria-valuemax')).toBe('100')
    expect(progress.attributes('aria-valuenow')).toBe('42')
    expect(progress.text()).toBe('42%')
    expect(wrapper.find('[data-loading-dots]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('shows an indeterminate progress without a value', () => {
    const wrapper = mount(ImageGenerate, { props: { status: 'generating' } })
    const progress = wrapper.find('[role="progressbar"]')

    expect(progress.attributes('aria-valuenow')).toBeUndefined()
    expect(progress.text()).toBe('')
    expect(wrapper.find('[data-loading-dots]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('clamps the progress to its range', () => {
    const high = mount(ImageGenerate, {
      props: { status: 'generating', progress: 150 },
    })
    const low = mount(ImageGenerate, {
      props: { status: 'generating', progress: -20 },
    })

    expect(high.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
    expect(low.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('0')

    high.unmount()
    low.unmount()
  })

  it('shows the error state and a retry action', async () => {
    const wrapper = mount(ImageGenerate, { props: { status: 'error' } })
    const root = wrapper.find('[data-image-generate]')
    const alert = wrapper.find('[role="alert"]')

    expect(root.attributes('data-status')).toBe('error')
    expect(alert.text()).toContain('Generation failed')
    expect(wrapper.find('button').text()).toBe('Try again')

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('generate')).toHaveLength(1)

    wrapper.unmount()
  })

  it('renders custom generating and error content', () => {
    const wrapper = mount(ImageGenerate, {
      props: { status: 'generating' },
      slots: { generating: '<span data-generating>Painting</span>' },
    })
    const error = mount(ImageGenerate, {
      props: { status: 'error' },
      slots: { error: '<span data-error>Request failed</span>' },
    })

    expect(wrapper.find('[data-generating]').text()).toBe('Painting')
    expect(wrapper.find('.pxd-image-generate--haze').exists()).toBe(false)
    expect(error.find('[data-error]').text()).toBe('Request failed')

    wrapper.unmount()
    error.unmount()
  })

  it('hides the progress once the image is done', () => {
    const wrapper = mount(ImageGenerate, {
      props: { src: 'generated.png', status: 'done', progress: 100 },
    })

    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false)

    wrapper.unmount()
  })
})
