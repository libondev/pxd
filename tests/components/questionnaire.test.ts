import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import Questionnaire from '../../src/components/questionnaire/index.vue'

function createQuestion(overrides: Record<string, unknown> = {}) {
  return {
    header: 'flow',
    question: 'Which flow should run?',
    multiSelect: false,
    allowFreeformInput: false,
    options: [
      { label: 'Save only', description: 'Save the document' },
      { label: 'Save and run', description: 'Save and start the flow' },
    ],
    ...overrides,
  }
}

describe('questionnaire', () => {
  it('submits immediately after selecting the last single-choice answer', async () => {
    const wrapper = mount(Questionnaire, {
      props: {
        data: [createQuestion()],
      },
    })

    await wrapper.get('[data-list-item]').trigger('click')

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          flow: {
            selected: ['Save only'],
            freeText: '',
            skipped: false,
          },
        },
      ],
    ])
    expect(wrapper.text()).toContain('Save only')

    wrapper.unmount()
  })

  it('keeps multi-select changes until the submit button is pressed', async () => {
    const wrapper = mount(Questionnaire, {
      props: {
        data: [
          createQuestion({
            multiSelect: true,
            options: [
              { label: 'First', description: 'First option' },
              { label: 'Second', description: 'Second option' },
            ],
          }),
        ],
      },
    })

    const items = wrapper.findAll('[data-list-item]')
    await items[0].trigger('click')
    await items[1].trigger('click')

    expect(wrapper.emitted('submit')).toBeUndefined()

    await wrapper.get('button[data-variant="primary"]').trigger('click')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      flow: {
        selected: ['First', 'Second'],
        freeText: '',
        skipped: false,
      },
    })

    wrapper.unmount()
  })

  it('submits a freeform answer when it is entered manually', async () => {
    const wrapper = mount(Questionnaire, {
      props: {
        data: [createQuestion({ allowFreeformInput: true })],
      },
    })

    await wrapper.get('input').setValue('A custom flow')
    await wrapper.get('button[data-variant="primary"]').trigger('click')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      flow: {
        selected: [],
        freeText: 'A custom flow',
        skipped: false,
      },
    })

    wrapper.unmount()
  })

  it('skips the current question and advances to the next one', async () => {
    const wrapper = mount(Questionnaire, {
      props: {
        data: [
          createQuestion(),
          createQuestion({
            header: 'mode',
            question: 'Which mode should run?',
            options: [{ label: 'Run safely', description: 'Use the safe mode' }],
          }),
        ],
      },
    })

    const skipButton = wrapper.findAll('button').find((button) => button.text() === 'Skip')

    await skipButton!.trigger('click')

    expect(wrapper.text()).toContain('Which mode should run?')
    expect(wrapper.emitted('submit')).toBeUndefined()

    wrapper.unmount()
  })

  it('submits the last question as skipped', async () => {
    const wrapper = mount(Questionnaire, {
      props: {
        data: [createQuestion({ multiSelect: true })],
      },
    })

    const buttons = wrapper.findAll('button')
    const skipButton = buttons.find((button) => button.text() === 'Skip')

    await skipButton!.trigger('click')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      flow: {
        selected: [],
        freeText: null,
        skipped: true,
      },
    })

    wrapper.unmount()
  })

  it('labels icon buttons with a title and accessible name', () => {
    const wrapper = mount(Questionnaire, {
      props: {
        data: [createQuestion(), createQuestion({ header: 'mode' })],
      },
    })

    const skipAll = wrapper.get('button[title="Skip all questions"]')
    const collapse = wrapper.get('button[title="Collapse"]')
    const prev = wrapper.get('button[title="Previous question"]')
    const next = wrapper.get('button[title="Next question"]')

    expect(skipAll.attributes('aria-label')).toBe('Skip all questions')
    expect(collapse.attributes('aria-label')).toBe('Collapse')
    expect(prev.attributes('aria-label')).toBe('Previous question')
    expect(next.attributes('aria-label')).toBe('Next question')

    wrapper.unmount()
  })

  it('folds the question from the title row', async () => {
    const wrapper = mount(Questionnaire, {
      props: {
        data: [createQuestion(), createQuestion({ header: 'mode' })],
      },
    })

    expect(wrapper.get('.pxd-questionnaire--question').text()).toContain('Which flow should run?')
    expect(wrapper.get('details').attributes('open')).toBeDefined()

    await wrapper.get('summary').trigger('click')

    expect(wrapper.get('details').attributes('open')).toBeUndefined()

    await wrapper.get('summary').trigger('click')

    expect(wrapper.get('details').attributes('open')).toBeDefined()

    wrapper.unmount()
  })

  it('folds the question from the arrow button', async () => {
    const wrapper = mount(Questionnaire, {
      props: {
        data: [createQuestion(), createQuestion({ header: 'mode' })],
      },
    })
    const collapse = () => wrapper.get('button[title="Collapse"]')

    expect(collapse().attributes('aria-expanded')).toBe('true')

    await collapse().trigger('click')

    expect(wrapper.get('details').attributes('open')).toBeUndefined()
    expect(wrapper.get('button[title="Expand"]').attributes('aria-expanded')).toBe('false')

    await wrapper.get('button[title="Expand"]').trigger('click')

    expect(wrapper.get('details').attributes('open')).toBeDefined()

    wrapper.unmount()
  })

  it('applies the expand command from outside', async () => {
    const wrapper = mount(Questionnaire, {
      props: {
        data: [createQuestion(), createQuestion({ header: 'mode' })],
        expand: false,
      },
    })

    expect(wrapper.get('details').attributes('open')).toBeUndefined()

    await wrapper.setProps({ expand: true })
    await nextTick()

    expect(wrapper.get('details').attributes('open')).toBeDefined()

    await wrapper.get('summary').trigger('click')
    await nextTick()

    expect(wrapper.get('details').attributes('open')).toBeUndefined()

    wrapper.unmount()
  })

  it('keeps the folded questions in the DOM for find-in-page', async () => {
    const wrapper = mount(Questionnaire, {
      props: {
        data: [createQuestion(), createQuestion({ header: 'mode' })],
      },
    })

    await wrapper.get('summary').trigger('click')

    expect(wrapper.get('details').attributes('open')).toBeUndefined()
    expect(wrapper.find('[data-list-item]').exists()).toBe(true)
    expect(wrapper.find('button[title="Previous question"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('folds the questions from a natively focusable summary', () => {
    const wrapper = mount(Questionnaire, {
      props: {
        data: [createQuestion(), createQuestion({ header: 'mode' })],
      },
      attachTo: document.body,
    })

    const summary = wrapper.get<HTMLElement>('summary')

    // A summary is Tab-reachable and responds to Enter/Space without a key handler.
    expect(summary.element.tagName).toBe('SUMMARY')
    expect(summary.attributes('role')).toBeUndefined()

    summary.element.focus()

    expect(document.activeElement).toBe(summary.element)

    wrapper.unmount()
  })

  it('cancels the summary default action when skip-all is pressed', async () => {
    const wrapper = mount(Questionnaire, {
      props: {
        data: [createQuestion(), createQuestion({ header: 'mode' })],
      },
      attachTo: document.body,
    })

    const skipAll = wrapper.get<HTMLButtonElement>('button[title="Skip all questions"]').element
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })

    skipAll.dispatchEvent(event)
    await nextTick()

    // stopPropagation alone would leave the summary free to open/close natively.
    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.text()).toContain('Skipped questions')

    wrapper.unmount()
  })

  it('submits every answer as skipped and enters the skipped state', async () => {
    const wrapper = mount(Questionnaire, {
      props: {
        data: [createQuestion()],
      },
    })

    await wrapper.get('button[title="Skip all questions"]').trigger('click')

    expect(wrapper.text()).toContain('Skipped questions')
    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      flow: {
        selected: [],
        freeText: null,
        skipped: true,
      },
    })

    wrapper.unmount()
  })

  it('resets its state when the questions reference changes', async () => {
    const wrapper = mount(Questionnaire, {
      props: {
        data: [createQuestion()],
      },
    })

    await wrapper.get('[data-list-item]').trigger('click')
    await wrapper.setProps({
      data: [
        createQuestion({
          header: 'mode',
          question: 'Which mode should run?',
          options: [{ label: 'Run safely', description: 'Use the safe mode' }],
        }),
      ],
    })

    expect(wrapper.text()).toContain('Which mode should run?')
    expect(wrapper.text()).not.toContain('Save only')

    wrapper.unmount()
  })
})
