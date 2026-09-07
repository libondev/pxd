import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
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
        questions: [createQuestion()],
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
        questions: [
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
        questions: [createQuestion({ allowFreeformInput: true })],
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
        questions: [
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
        questions: [createQuestion({ multiSelect: true })],
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
        questions: [createQuestion(), createQuestion({ header: 'mode' })],
      },
    })

    const skipAll = wrapper.get('button[title="Skip all questions"]')
    const collapse = wrapper.get('button[title="Collapse"]')
    const prev = wrapper.get('button[title="Previous question"]')
    const next = wrapper.get('button[title="Next question"]')

    expect(skipAll.attributes('aria-label')).toBe('Skip all questions')
    expect(collapse.attributes('aria-label')).toBe('Collapse')
    expect(collapse.attributes('aria-expanded')).toBe('true')
    expect(prev.attributes('aria-label')).toBe('Previous question')
    expect(next.attributes('aria-label')).toBe('Next question')

    wrapper.unmount()
  })

  it('clears answers and enters the skipped state', async () => {
    const wrapper = mount(Questionnaire, {
      props: {
        questions: [createQuestion()],
      },
    })

    await wrapper.findAll('button')[0].trigger('click')

    expect(wrapper.text()).toContain('Skipped questions')
    expect(wrapper.emitted('submit')).toBeUndefined()

    wrapper.unmount()
  })

  it('resets its state when the questions reference changes', async () => {
    const wrapper = mount(Questionnaire, {
      props: {
        questions: [createQuestion()],
      },
    })

    await wrapper.get('[data-list-item]').trigger('click')
    await wrapper.setProps({
      questions: [
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
