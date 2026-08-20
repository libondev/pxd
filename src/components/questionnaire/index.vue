<script lang="ts" setup>
import type { ListOptionSelected } from '../list/types'
import type {
  QuestionnaireAnswer,
  QuestionnaireEmits,
  QuestionnaireProps,
  QuestionnaireAnswers,
  QuestionnaireState,
  QuestionnaireQuestion,
} from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import CrossIcon from '@gdsicon/vue/cross'
import { computed, shallowReactive, shallowRef, watch } from 'vue'
import { useToggleValue } from '../../composables/use-toggle-value.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import PButton from '../button/index.vue'
import PInput from '../input/index.vue'
import PList from '../list/index.vue'

interface QuestionnaireOption {
  label: string
  value: string
  description: string
}

type QuestionnaireRenderQuestion = Omit<QuestionnaireQuestion, 'options'> & {
  options: QuestionnaireOption[]
}

function createInitialAnswers(questions: QuestionnaireQuestion[]): QuestionnaireAnswers {
  return questions.reduce((answers, question) => {
    answers[question.header] = {
      selected: [],
      freeText: '',
      skipped: true,
    }

    return answers
  }, {} as QuestionnaireAnswers)
}

function createSkippedAnswers(answers: QuestionnaireAnswers): QuestionnaireAnswers {
  return Object.keys(answers).reduce((skippedAnswers, header) => {
    skippedAnswers[header] = {
      selected: [],
      freeText: null,
      skipped: true,
    }

    return skippedAnswers
  }, {} as QuestionnaireAnswers)
}

function getQuestionOptions(question: QuestionnaireQuestion): QuestionnaireRenderQuestion {
  const options: QuestionnaireOption[] = question.options.map((option) => ({
    ...option,
    value: option.label,
  }))

  if (question.allowFreeformInput) {
    options.push({
      label: '',
      value: 'Enter custom answer',
      description: 'Enter custom answer',
    })
  }

  return {
    ...question,
    options,
  }
}

function getSelectedAnswerText(question: QuestionnaireQuestion, answer: QuestionnaireAnswer) {
  if (question.multiSelect) {
    return [...answer.selected, answer.freeText].filter(Boolean).join(', ')
  }

  return answer.freeText || answer.selected.join(', ')
}

defineOptions({
  name: 'PQuestionnaire',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<QuestionnaireProps>(), {
  questions: () => [],
})
const emits = defineEmits<QuestionnaireEmits>()

const configProvider = useConfigProvider()
const { value: isCollapsed, toggle: toggleCollapse } = useToggleValue(false)

const totalAnswers = shallowReactive<QuestionnaireAnswers>({})
const currentState = shallowRef<QuestionnaireState>('choosing')
const currentIndex = shallowRef(0)
const currentQuestion = computed(() => {
  const question = props.questions[currentIndex.value]

  return question ? getQuestionOptions(question) : null
})
const currentAnswer = computed(() => {
  const question = currentQuestion.value

  return question ? totalAnswers[question.header] : null
})

const showSubmitButton = computed(() => {
  const questionsCount = props.questions.length
  const question = currentQuestion.value

  if (!question) {
    return false
  }

  if (question.multiSelect) {
    return true
  }

  return currentIndex.value === questionsCount - 1 && question.allowFreeformInput
})

function buildInitAnswers() {
  Object.keys(totalAnswers).forEach((header) => {
    delete totalAnswers[header]
  })
  Object.assign(totalAnswers, createInitialAnswers(props.questions))
}

function toggleCurrentIndex(offset: number) {
  if (!props.questions.length) {
    currentIndex.value = 0
    return
  }

  currentIndex.value = Math.min(
    Math.max(currentIndex.value + offset, 0),
    props.questions.length - 1,
  )
}

function updateCurrentAnswer(update: (answer: QuestionnaireAnswer) => QuestionnaireAnswer) {
  const question = currentQuestion.value

  if (!question) {
    return
  }

  const answer = totalAnswers[question.header]
  totalAnswers[question.header] = update(answer)
}

function onAnswerItemSelect(item: ListOptionSelected) {
  const question = currentQuestion.value

  if (!question) {
    return
  }

  // ignore custom answer option
  if (!item.label) {
    return
  }

  const value = String(item.value)

  updateCurrentAnswer((answer) => {
    if (question.multiSelect) {
      const selected = answer.selected.includes(value)
        ? answer.selected.filter((itemValue) => itemValue !== value)
        : [...answer.selected, value]

      return { ...answer, selected }
    }

    return { ...answer, freeText: '', selected: [value] }
  })

  if (
    currentIndex.value === props.questions.length - 1 &&
    !question.multiSelect &&
    !question.allowFreeformInput
  ) {
    onSubmitAnswers()
    return
  }

  toggleCurrentIndex(1)
}

function onFreeformInput(value: string) {
  updateCurrentAnswer((answer) => ({ ...answer, freeText: value }))
}

// When the radio is selected, the selected item will be deselected if the text is entered manually.
function onFreeformInputChange() {
  const question = currentQuestion.value

  if (!question) {
    return
  }

  if (question.multiSelect) {
    return
  }

  updateCurrentAnswer((answer) => ({ ...answer, selected: [] }))
}

function skipAllQuestions() {
  Object.assign(totalAnswers, createSkippedAnswers(totalAnswers))
  currentState.value = 'skipped'
}

function onSubmitAnswers() {
  currentState.value = 'submitted'
  emits('submit', { ...totalAnswers })
}

watch(
  () => props.questions,
  () => {
    currentState.value = 'choosing'
    currentIndex.value = 0
    buildInitAnswers()
  },
  { immediate: true },
)
</script>

<template>
  <div
    class="pxd-questionnaire w-full max-w-full rounded-lg border bg-background-100"
    v-bind="$attrs"
  >
    <template v-if="currentState === 'choosing' && currentQuestion && currentAnswer">
      <div
        class="pxd-questionnaire--title py-2 ps-4 pe-2 gap-1 text-sm flex items-center justify-between"
        :class="{ 'border-b': !isCollapsed }"
      >
        <span class="font-medium flex-1">{{ currentQuestion.question }}</span>

        <PButton variant="ghost" size="sm" icon @click="skipAllQuestions">
          <CrossIcon />
        </PButton>
        <PButton variant="ghost" size="sm" icon @click="toggleCollapse()">
          <ChevronDownIcon />
        </PButton>
      </div>

      <template v-if="!isCollapsed">
        <PList
          :value="currentAnswer.selected"
          :options="currentQuestion.options"
          @select="onAnswerItemSelect"
        >
          <template #item="{ item }">
            <PInput
              v-if="!item.label"
              :model-value="currentAnswer.freeText"
              :size="configProvider.size"
              :placeholder="item.description"
              class="-me-6 w-[calc(100%+1.5rem)] max-w-none"
              @update:model-value="onFreeformInput"
              @change="onFreeformInputChange"
              @click.stop
            />
          </template>
        </PList>

        <div
          v-if="questions.length > 1 || showSubmitButton"
          class="p-2 flex items-center justify-between border-t"
        >
          <div v-if="questions.length > 1" class="gap-1 flex items-center">
            <PButton
              variant="ghost"
              :size="configProvider.size"
              :class="{ 'pointer-events-none opacity-50': !currentIndex }"
              icon
              @click="toggleCurrentIndex(-1)"
            >
              <ChevronDownIcon class="rotate-90" />
            </PButton>

            <PButton
              variant="ghost"
              :size="configProvider.size"
              :class="{ 'pointer-events-none opacity-50': currentIndex >= questions.length - 1 }"
              icon
              @click="toggleCurrentIndex(1)"
            >
              <ChevronDownIcon class="-rotate-90" />
            </PButton>

            <span class="text-sm ms-2 text-foreground-secondary tabular-nums select-none">
              {{ currentIndex + 1 }}/{{ questions.length }}
            </span>
          </div>

          <div v-show="showSubmitButton" class="ms-auto">
            <PButton :size="configProvider.size" variant="primary" @click="onSubmitAnswers">
              {{ configProvider.locale.confirm.submit }}
            </PButton>
          </div>
        </div>
      </template>
    </template>

    <template v-else-if="currentState === 'submitted'">
      <ul class="!px-4 !py-3 !m-0 pxd-questionnaire--answers gap-2 flex list-none flex-col">
        <li v-for="(question, index) of questions" :key="index" class="!m-0 text-sm">
          <p class="!m-0 text-foreground-secondary">
            {{ configProvider.locale.interactive.q }}: {{ question.question }}
          </p>
          <p class="!m-0 font-medium">
            {{ configProvider.locale.interactive.a }}:
            {{ getSelectedAnswerText(question, totalAnswers[question.header]) }}
          </p>
        </li>
      </ul>
    </template>

    <template v-else-if="currentState === 'skipped'">
      <p class="pxd-questionnaire--skipped text-sm p-2 cursor-default text-foreground-secondary">
        Skipped questions
      </p>
    </template>
  </div>
</template>
