<script setup lang="ts">
import { shallowRef, watchEffect } from 'vue'

const darkMode = shallowRef(true)

const options = [
  'Apple',
  'Banana',
  'Blueberry',
].map(value => ({ label: value, value }))

const single = ref('')
const multiple = ref([])

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
  // darkMode.value ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
})
</script>

<template>
  <div class=" gap-2">
    <!-- <PBook title="web frontend" /> -->

    <div>单选：{{ single }}</div>
    <div>多选：{{ multiple }}</div>

    <PInput>
      <template #prefix>
        000
      </template>
      <template #suffix>
        111
      </template>
    </PInput>
    <PInput />
    <PInput error="an error message" />

    <PInput disabled />

    <!-- <PBadge>123</PBadge>
    <PBadge variant="gray">
      123
    </PBadge>
    <PBadge variant="blue">
      123
    </PBadge>
    <PBadge variant="purple">
      123
    </PBadge>
    <PBadge variant="amber">
      123
    </PBadge>
    <PBadge variant="green">
      123
    </PBadge>
    <PBadge variant="red">
      123
    </PBadge>
    <PBadge variant="pink">
      123
    </PBadge>
    <PBadge variant="teal">
      123
    </PBadge>
    <PBadge variant="inverted">
      123
    </PBadge>
    <PBadge variant="trial">
      Trial
    </PBadge>
    <PBadge variant="turborepo">
      Turborepo
    </PBadge>
    <PBadge variant="vue">
      Vue
    </PBadge>

    <PBadge variant="gray-subtle">
      123
    </PBadge>
    <PBadge variant="blue-subtle">
      123
    </PBadge>
    <PBadge variant="purple-subtle">
      123
    </PBadge>
    <PBadge variant="amber-subtle">
      123
    </PBadge>
    <PBadge variant="green-subtle">
      123
    </PBadge>
    <PBadge variant="red-subtle">
      123
    </PBadge>
    <PBadge variant="pink-subtle">
      123
    </PBadge>
    <PBadge variant="teal-subtle">
      123
    </PBadge> -->

    <!--
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
    </Scrollbar> -->
  </div>
</template>
