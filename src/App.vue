<script setup lang="ts">
import { shallowRef, watchEffect } from 'vue'

const darkMode = shallowRef(false)

const options = [
  'Apple',
  'Banana',
  'Blueberry',
].map(value => ({ label: value, value }))

const radioCheck = shallowRef('Apple')

const number = shallowRef(50)

const tabCheck = shallowRef('chinese')

const accordionOptions = [

  {
    value: 'item-1',
    label: 'Is it accessible?',
    content: 'Yes. It adheres to the WAI-ARIA design pattern.',
  },
  {
    value: 'item-2',
    label: 'Is it unstyled?',
    content: 'Yes. It\'s unstyled by default, giving you freedom over the look and feel.',
  },
  {
    value: 'item-3',
    label: 'Can it be animated?',
    content: 'Yes! You can use the transition prop to configure the animation.',
  },
]

watchEffect(() => {
  darkMode.value ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <PSwitch v-model="darkMode" />

    <PButton variant="default">
      Primary
    </PButton>

    <Dialog label="弹窗标题" description="这是一段很长的弹窗描述文本">
      <template #trigger>
        <PButton variant="outline">
          打开弹窗
        </PButton>
      </template>

      <span>是的, 这里是弹窗的内容</span>
    </Dialog>

    <p-input placeholder="Please Input" />

    <PSelect placeholder="Please Select" :options="options" />

    <PCheckbox name="approve" value="true">
      123123
    </PCheckbox>

    <PRadio v-model="radioCheck" :options="options" />

    <PProgress v-model="number" />

    <PTextarea size="lg" />

    <PTabs v-model="tabCheck">
      <PTabsItem label="chinese" value="chinese">
        中文
      </PTabsItem>
      <PTabsItem label="english" value="english">
        英文
      </PTabsItem>
      <PTabsItem label="number" value="number">
        2222
      </PTabsItem>
    </PTabs>

    <PAccordion class="w-full" :options="accordionOptions">
      1231
    </PAccordion>

    <Scrollbar class="h-100px">
      <ul>
        <li v-for="i of 30" :key="i">
          {{ i }}
        </li>
      </ul>
    </Scrollbar>
  </div>
</template>
