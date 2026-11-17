import type { QuestionnaireQuestion } from '../../src/components/questionnaire/types'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { createAgent } from '../../src/agent'
import Questionnaire from '../../src/components/questionnaire/index.vue'

const mounted: { unmount: () => void }[] = []

const track = <T extends { unmount: () => void }>(wrapper: T) => {
  mounted.push(wrapper)

  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
})

const questions: QuestionnaireQuestion[] = [
  {
    header: 'About you',
    question: 'What should we call you?',
    multiSelect: false,
    allowFreeformInput: false,
    options: [
      { label: 'Designer', description: 'Designs things' },
      { label: 'Engineer', description: 'Builds things' },
    ],
  },
  {
    header: 'Interests',
    question: 'What do you enjoy?',
    multiSelect: true,
    allowFreeformInput: false,
    options: [
      { label: 'Design', description: 'Shapes and type' },
      { label: 'Code', description: 'Tests and types' },
    ],
  },
]

const find = <T extends { component: string }>(entries: T[], component: string) =>
  entries.find((entry) => entry.component === component)!

function mountQuestionnaire(data: QuestionnaireQuestion[]) {
  return track(mount(Questionnaire, { props: { data } }))
}

describe('agent questionnaire', () => {
  it('should name itself by its header and carry the question on its row', () => {
    mountQuestionnaire(questions)
    const entry = find(createAgent().snapshot(), 'questionnaire')

    expect(entry).toMatchObject({
      label: 'About you',
      row: 'What should we call you?',
      index: 0,
      total: 2,
      status: 'choosing',
      multiSelect: false,
    })
    expect(entry.items).toEqual([
      { label: 'Designer', value: 'Designer' },
      { label: 'Engineer', value: 'Engineer' },
    ])
    expect(entry.actions).toEqual([
      'answer',
      'answerText',
      'next',
      'previous',
      'skip',
      'skipAll',
      'submit',
    ])
  })

  it('should take a single choice and move to the next question', async () => {
    mountQuestionnaire(questions)
    const agent = createAgent()
    const { ref } = find(agent.snapshot(), 'questionnaire')

    const result = await agent.act({ steps: [{ ref, action: 'answer', args: ['Engineer'] }] })

    expect(result.ok).toBe(true)
    expect(find(agent.snapshot(), 'questionnaire')).toMatchObject({
      header: 'Interests',
      row: 'What do you enjoy?',
      index: 1,
      selected: [],
    })
  })

  it('should toggle a multiple choice and stay on its question', async () => {
    mountQuestionnaire(questions)
    const agent = createAgent()
    const { ref } = find(agent.snapshot(), 'questionnaire')

    await agent.act({ steps: [{ ref, action: 'next' }] })
    await agent.act({ steps: [{ ref, action: 'answer', args: ['Design'] }] })
    await agent.act({ steps: [{ ref, action: 'answer', args: ['Code'] }] })

    expect(find(agent.snapshot(), 'questionnaire')).toMatchObject({
      index: 1,
      selected: ['Design', 'Code'],
    })

    await agent.act({ steps: [{ ref, action: 'answer', args: ['Design'] }] })

    expect(find(agent.snapshot(), 'questionnaire')).toMatchObject({ selected: ['Code'] })
  })

  it('should type the freeform answer and clear a single choice', async () => {
    mountQuestionnaire([
      {
        ...questions[0],
        allowFreeformInput: true,
      },
    ])
    const agent = createAgent()
    const { ref } = find(agent.snapshot(), 'questionnaire')

    await agent.act({ steps: [{ ref, action: 'answerText', args: ['just Ada'] }] })

    expect(find(agent.snapshot(), 'questionnaire')).toMatchObject({
      freeText: 'just Ada',
      selected: [],
    })
  })

  it('should name the options a step could have meant', async () => {
    mountQuestionnaire(questions)
    const agent = createAgent()
    const { ref } = find(agent.snapshot(), 'questionnaire')
    const result = await agent.act({ steps: [{ ref, action: 'answer', args: ['Manager'] }] })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toContain('No option "Manager"')
    expect(result.error?.message).toContain('Designer, Engineer')
  })

  it('should submit the last single choice and report the answers', async () => {
    const wrapper = mountQuestionnaire([questions[0]])
    const agent = createAgent()
    const { ref } = find(agent.snapshot(), 'questionnaire')

    const result = await agent.act({ steps: [{ ref, action: 'answer', args: ['Designer'] }] })

    expect(result.ok).toBe(true)
    expect(find(agent.snapshot(), 'questionnaire')).toMatchObject({ status: 'submitted' })
    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({
      'About you': { selected: ['Designer'], skipped: false },
    })
  })

  it('should skip every question through skipAll', async () => {
    const wrapper = mountQuestionnaire(questions)
    const agent = createAgent()
    const { ref } = find(agent.snapshot(), 'questionnaire')

    await agent.act({ steps: [{ ref, action: 'skipAll' }] })

    expect(find(agent.snapshot(), 'questionnaire')).toMatchObject({ status: 'skipped' })
    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({
      'About you': { selected: [], skipped: true },
      Interests: { selected: [], skipped: true },
    })
  })
})
