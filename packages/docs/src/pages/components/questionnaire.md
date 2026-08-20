# Questionnaire

An interactive questionnaire component for collecting structured user input through single-select, multi-select, and free-text questions.

## Default

```vue demo
<script setup>
const questions = [
  {
    "header": "按钮流程",
    "question": "新增按钮点击后应执行哪种流程？",
    "multiSelect": false,
    "allowFreeformInput": false,
    "options": [
      {
        "label": "1. 仅保存文档",
        "description": "将《需求确认稿》保存到根目录的 docs 文件夹，然后停留在当前澄清阶段。"
      },
      {
        "label": "2. 保存并开始实现",
        "description": "先保存 Markdown 文档，再自动进入“开始实现”流程。"
      }
    ]
  }
]

function onSubmit(answers) {
  console.log(answers)
}
</script>

<template>
  <PQuestionnaire :questions="questions" @submit="onSubmit" />
</template>
```

## Freeform input

When `allowFreeformInput=true`, even single selection needs manual confirmation.

```vue demo
<script setup>
const questions = [
  {
    "header": "按钮流程",
    "question": "新增按钮点击后应执行哪种流程？",
    "multiSelect": false,
    "allowFreeformInput": true,
    "options": [
      {
        "label": "1. 仅保存文档",
        "description": "将《需求确认稿》保存到根目录的 docs 文件夹，然后停留在当前澄清阶段。"
      },
      {
        "label": "2. 保存并开始实现",
        "description": "先保存 Markdown 文档，再自动进入“开始实现”流程。"
      }
    ]
  }
]

function onSubmit(answers) {
  console.log(answers)
}
</script>

<template>
  <PQuestionnaire :questions="questions" @submit="onSubmit" />
</template>
```

## Multi-topic

```vue demo
<script setup>
const questions = [
  {
    "header": "按钮流程",
    "question": "新增按钮点击后应执行哪种流程？",
    "multiSelect": false,
    "allowFreeformInput": true,
    "options": [
      {
        "label": "1. 仅保存文档",
        "description": "将《需求确认稿》保存到根目录的 docs 文件夹，然后停留在当前澄清阶段。"
      },
      {
        "label": "2. 保存并开始实现",
        "description": "先保存 Markdown 文档，再自动进入“开始实现”流程。"
      }
    ]
  },
  {
    "header": "启用功能",
    "question": "你希望同时启用哪些功能？",
    "multiSelect": true,
    "allowFreeformInput": true,
    "options": [
      {
        "label": "自动保存",
        "description": "编辑后自动保存内容"
      },
      {
        "label": "错误提示",
        "description": "及时显示校验和运行错误"
      },
      {
        "label": "快捷操作",
        "description": "提供键盘快捷方式"
      }
    ]
  }
]

function onSubmit(answers) {
  console.log(answers)
}
</script>

<template>
  <PQuestionnaire :questions="questions" @submit="onSubmit" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| questions | `QuestionnaireQuestion[]` | `[]` | Questions to display. |

### QuestionnaireQuestion

| Name | Type | Description |
| --- | --- | --- |
| header | `string` | Unique key used to identify the question in the submitted answers. |
| question | `string` | Question text displayed above the options. |
| multiSelect | `boolean` | Whether multiple options can be selected. |
| allowFreeformInput | `boolean` | Whether to append a free-text answer field. |
| options | `Array<{ label: string; description: string }>` | Selectable options and their descriptions. |

## Events

| Name | Parameters | Description |
| --- | --- | --- |
| submit | `(answers: QuestionnaireAnswers)` | Emitted when the questionnaire is submitted. |

`answers` is keyed by each question's `header`:

```ts
interface QuestionnaireAnswer {
  selected: string[]
  freeText: string | null
  skipped: boolean
}
```

For example:

```ts
{
  '按钮流程': {
    selected: ['1. 仅保存文档'],
    freeText: '',
    skipped: true,
  },
}
```
