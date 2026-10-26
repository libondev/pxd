<script lang="ts" setup>
import type { ComponentSize } from '../../types/shared/props'
import type { ListModelValue, ListOptionSelected } from '../list/types'
import type {
  QuestionnaireAnswer,
  QuestionnaireEmits,
  QuestionnaireProps,
  QuestionnaireAnswers,
  QuestionnaireState,
  QuestionnaireQuestion,
} from './types'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import CrossIcon from '@gdsicon/vue/cross'
import QuestionIcon from '@gdsicon/vue/question'
import { computed, shallowReactive, shallowRef, watch } from 'vue'
import { useDetailsCollapse } from '../../composables/_internal/use-details-collapse.js'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { toArray } from '../../utils/format.js'
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

defineOptions({
  name: 'PQuestionnaire',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<QuestionnaireProps>(), {
  data: () => [],
  expand: true,
})
const emits = defineEmits<QuestionnaireEmits>()

const SIZE_CLASSES: Record<
  ComponentSize,
  {
    header: string
    item: string
    footer: string
    answers: string
    skipped: string
    icon: string
  }
> = {
  sm: {
    header: 'py-1.5 ps-2.5 pe-1.5',
    item: 'min-h-7 text-xs',
    footer: 'p-1.5',
    answers: 'px-3! py-2!',
    skipped: 'h-10 px-2.5',
    icon: 'size-3',
  },
  md: {
    header: 'py-1.5 ps-3 pe-2',
    item: 'min-h-8 text-sm',
    footer: 'p-2',
    answers: 'px-3.5! py-2.5!',
    skipped: 'h-11 px-3',
    icon: 'size-3',
  },
  lg: {
    header: 'py-2 ps-3 pe-2',
    item: 'min-h-9 text-base',
    footer: 'p-2.5',
    answers: 'px-4! py-3!',
    skipped: 'h-12 px-3',
    icon: 'size-4',
  },
}

const contentRef = shallowRef<HTMLElement>()
const totalAnswers = shallowReactive<QuestionnaireAnswers>({})
const currentState = shallowRef<QuestionnaireState>('choosing')
const currentIndex = shallowRef(0)
const currentQuestion = computed(() => {
  const question = props.data[currentIndex.value]

  return question ? getQuestionOptions(question) : null
})
const currentAnswer = computed(() => {
  const question = currentQuestion.value

  return question ? totalAnswers[question.header] : null
})

const showSubmitButton = computed(() => {
  const questionsCount = props.data.length
  const question = currentQuestion.value

  if (!question) {
    return false
  }

  if (question.multiSelect) {
    return true
  }

  return currentIndex.value === questionsCount - 1 && question.allowFreeformInput
})

const configProvider = useConfigProvider()

const computedSize = computed(() => props.size || configProvider.size)
const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-questionnaire w-full max-w-full rounded-xl border bg-background-100 empty:hidden',
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
  },
  {
    selection: () => ({ size: computedSize.value }),
  },
)

const { isOpen, detailsOpen, onToggleClick, onDetailsToggle } = useDetailsCollapse(
  contentRef,
  () => props.expand,
)
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

function buildInitAnswers() {
  Object.keys(totalAnswers).forEach((header) => {
    delete totalAnswers[header]
  })
  Object.assign(totalAnswers, createInitialAnswers(props.data))
}

function toggleCurrentIndex(offset: number) {
  if (!props.data.length) {
    currentIndex.value = 0
    return
  }

  currentIndex.value = Math.min(Math.max(currentIndex.value + offset, 0), props.data.length - 1)
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

  // Freeform row is not a real answer — undo the model update above.
  if (!item.label) {
    updateCurrentAnswer((answer) => ({
      ...answer,
      selected: answer.selected.filter((itemValue) => itemValue !== String(item.value)),
    }))
    return
  }

  if (
    currentIndex.value === props.data.length - 1 &&
    !question.multiSelect &&
    !question.allowFreeformInput
  ) {
    onSubmitAnswers()
    return
  }

  toggleCurrentIndex(1)
}

function onListModelUpdate(next: ListModelValue) {
  const question = currentQuestion.value

  if (!question) {
    return
  }

  const selected = question.multiSelect
    ? toArray(next).map(String)
    : next == null || next === ''
      ? []
      : [String(next)]

  updateCurrentAnswer((answer) => ({
    ...answer,
    selected,
    freeText: question.multiSelect ? answer.freeText : '',
  }))
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

function getFinalAnswers() {
  return Object.entries(totalAnswers).reduce((answers, [header, answer]) => {
    if (answer.selected.length || answer.freeText?.trim().length) {
      answer.skipped = false
    } else {
      answer.skipped = true
    }

    answers[header] = {
      ...answer,
      skipped: !answer.selected.length && !answer.freeText?.trim().length,
    }

    return answers
  }, {} as QuestionnaireAnswers)
}

function getToggleLabel() {
  return isOpen.value
    ? configProvider.locale.questionnaire.collapse
    : configProvider.locale.questionnaire.expand
}

function skipAllQuestions() {
  Object.assign(totalAnswers, createSkippedAnswers(totalAnswers))
  currentState.value = 'skipped'
  emits('submit', getFinalAnswers())
}

function skipCurrentQuestion() {
  updateCurrentAnswer(() => ({
    selected: [],
    freeText: null,
    skipped: true,
  }))

  if (currentIndex.value >= props.data.length - 1) {
    onSubmitAnswers()
    return
  }

  toggleCurrentIndex(1)
}

function onSubmitAnswers() {
  currentState.value = 'submitted'
  emits('submit', getFinalAnswers())
}

watch(
  () => props.data,
  () => {
    currentState.value = 'choosing'
    currentIndex.value = 0
    buildInitAnswers()
  },
  { immediate: true },
)
</script>

<template>
  <div data-questionnaire :class="classes" v-bind="attrs">
    <template v-if="currentState === 'choosing' && currentQuestion && currentAnswer">
      <details class="pxd-questionnaire--details" :open="detailsOpen" @toggle="onDetailsToggle">
        <summary
          class="pxd-questionnaire--title gap-2 flex w-full cursor-pointer touch-manipulation list-none appearance-none items-center border-none bg-transparent font-inherit text-inherit self-focus-ring outline-none select-none"
          :class="[SIZE_CLASSES[computedSize].header, { 'border-b': detailsOpen }]"
          @click.prevent="onToggleClick"
        >
          <QuestionIcon class="font-medium shrink-0" :class="SIZE_CLASSES[computedSize].icon" />

          <span class="pxd-questionnaire--question min-w-0 font-medium flex-1 truncate">
            {{ currentQuestion.question }}
          </span>

          <!-- preventDefault is load-bearing: stopping propagation alone would leave
               the summary's native disclosure default action free to run. -->
          <PButton
            icon
            size="xs"
            variant="ghost"
            :title="configProvider.locale.questionnaire.skipAll"
            :aria-label="configProvider.locale.questionnaire.skipAll"
            @click.prevent.stop="skipAllQuestions"
          >
            <CrossIcon aria-hidden="true" />
          </PButton>

          <PButton
            icon
            size="xs"
            variant="ghost"
            :title="getToggleLabel()"
            :aria-label="getToggleLabel()"
            :aria-expanded="isOpen"
            @click.prevent.stop="onToggleClick"
          >
            <ChevronRightIcon
              aria-hidden="true"
              class="motion-safe:transition-transform"
              :class="{ 'rotate-90': isOpen }"
            />
          </PButton>
        </summary>

        <div
          ref="contentRef"
          class="grid-template-cols-1fr grid overflow-hidden rounded-b-xl motion-safe:transition-[grid-template-rows]"
          :class="isOpen ? 'grid-template-rows-1fr' : 'grid-template-rows-0fr'"
        >
          <div class="pxd-questionnaire--content border-t">
            <PList
              class="max-h-60"
              :model-value="currentAnswer.selected"
              :multiple="currentQuestion.multiSelect"
              :options="currentQuestion.options"
              :item-class="SIZE_CLASSES[computedSize].item"
              @update:model-value="onListModelUpdate"
              @change="onAnswerItemSelect"
            >
              <template #item="{ item }">
                <div v-if="item.label" class="flex flex-col">
                  <span>{{ item.label }}</span>
                  <span class="text-foreground-secondary">{{ item.description }}</span>
                </div>

                <PInput
                  v-else
                  :model-value="currentAnswer.freeText"
                  :placeholder="item.description"
                  :size="computedSize"
                  class="-me-6 my-0.5 w-[calc(100%+1.5rem)] max-w-none"
                  @update:model-value="onFreeformInput"
                  @change="onFreeformInputChange"
                  @click.stop
                />
              </template>
            </PList>

            <div
              v-if="data.length > 1 || showSubmitButton"
              class="flex items-center justify-between border-t"
              :class="SIZE_CLASSES[computedSize].footer"
            >
              <div v-if="data.length > 1" class="gap-1 flex items-center">
                <PButton
                  icon
                  size="xs"
                  variant="ghost"
                  :class="{ 'pointer-events-none opacity-50': !currentIndex }"
                  :title="configProvider.locale.questionnaire.prev"
                  :aria-label="configProvider.locale.questionnaire.prev"
                  :aria-disabled="!currentIndex"
                  @click="toggleCurrentIndex(-1)"
                >
                  <ChevronRightIcon class="rotate-180" aria-hidden="true" />
                </PButton>

                <PButton
                  icon
                  size="xs"
                  variant="ghost"
                  :class="{
                    'pointer-events-none opacity-50': currentIndex >= data.length - 1,
                  }"
                  :title="configProvider.locale.questionnaire.next"
                  :aria-label="configProvider.locale.questionnaire.next"
                  :aria-disabled="currentIndex >= data.length - 1"
                  @click="toggleCurrentIndex(1)"
                >
                  <ChevronRightIcon aria-hidden="true" />
                </PButton>

                <span class="ms-2 text-foreground-secondary tabular-nums select-none">
                  {{ currentIndex + 1 }}/{{ data.length }}
                </span>
              </div>

              <div class="gap-2 ms-auto flex items-center">
                <PButton size="xs" variant="ghost" @click="skipCurrentQuestion">
                  {{ configProvider.locale.interaction.skip }}
                </PButton>

                <PButton
                  size="xs"
                  v-show="showSubmitButton"
                  variant="primary"
                  @click="onSubmitAnswers"
                >
                  {{ configProvider.locale.interaction.submit }}
                </PButton>
              </div>
            </div>
          </div>
        </div>
      </details>
    </template>

    <template v-else-if="currentState === 'submitted'">
      <ul
        class="m-0! pxd-questionnaire--answers gap-2 flex list-none flex-col"
        :class="SIZE_CLASSES[computedSize].answers"
      >
        <li v-for="(question, index) of data" :key="index" class="pxd-questionnaire--item m-0!">
          <p class="m-0! text-foreground-secondary">
            {{ configProvider.locale.questionnaire.question }}: {{ question.question }}
          </p>
          <p class="m-0! font-medium">
            {{ configProvider.locale.questionnaire.answer }}:
            {{ getSelectedAnswerText(question, totalAnswers[question.header]) }}
          </p>
        </li>
      </ul>
    </template>

    <template v-else-if="currentState === 'skipped'">
      <p
        class="pxd-questionnaire--skipped flex cursor-default items-center text-foreground-secondary italic"
        :class="SIZE_CLASSES[computedSize].skipped"
      >
        Skipped questions
      </p>
    </template>
  </div>
</template>
