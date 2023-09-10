<script setup lang="ts">
import { shallowRef, watchEffect } from 'vue'

import PxButton from './components/button'
import PxSwitch from './components/switch'
import PxSelect from './components/select'
import PxInput from './components/input'
import PxCheckbox from './components/checkbox'
import PxRadio from './components/radio'
import PxTabs from './components/tabs'
import PxTabsItem from './components/tabs-item'
import PxTextarea from './components/textarea'
import PxProgress from './components/progress'
import Dialog from './components/dialog'
import Scrollbar from './components/scrollbar'
import PxAccordion from './components/accordion'

const darkMode = shallowRef(false)

const options = [
'Apple', 'Banana', 'Blueberry'
].map((value) => ({ label: value, value }))

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
    <PxSwitch v-model="darkMode" />

    <PxButton variant="default">
      Primary
    </PxButton>

    <Dialog label="弹窗标题" description="这是一段很长的弹窗描述文本">
      <template #trigger>
        <px-button variant="outline">打开弹窗</px-button>
      </template>

      <span>是的, 这里是弹窗的内容</span>
    </Dialog>

    <PxInput placeholder="Please Input"></PxInput>

    <PxSelect placeholder="Please Select" :options="options" />

    <PxCheckbox name="approve" value="true">123123</PxCheckbox>

    <PxRadio v-model="radioCheck" :options="options">
    </PxRadio>

    <PxProgress v-model="number" />

    <PxTextarea size="lg" />

    <px-tabs v-model="tabCheck">
      <px-tabs-item label="chinese" value="chinese">中文</px-tabs-item>
      <px-tabs-item label="english" value="english">英文</px-tabs-item>
      <px-tabs-item label="number" value="number">2222</px-tabs-item>
    </px-tabs>

    <px-accordion class="w-full" :options="accordionOptions">
      1231
    </px-accordion>

    <Scrollbar class="h-100px">
      <ul>
        <li v-for="i of 30" :key="i">{{  i  }}</li>
      </ul>
    </Scrollbar>
  </div>
</template>
