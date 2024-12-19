<script lang="ts" setup>
import { CheckIcon, CopyIcon } from 'gdsi/vue'
import { type BundledLanguage, codeToHtml } from 'shiki'
import PButton from '#/components/button/index.js'

interface CodeBlockProps {
  code: string
  filename?: string
  language?: BundledLanguage
}

const {
  code,
  filename,
  language = 'typescript',
} = defineProps<CodeBlockProps>()

const codeHtml = shallowRef('')
const isCopied = shallowRef(false)

watch(
  () => code,
  async (_code) => {
    if (!_code) {
      codeHtml.value = ''
      return
    }

    const html = await codeToHtml(_code, {
      lang: language,
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    })

    codeHtml.value = html
  },
  { immediate: true },
)

let resetTimerId: NodeJS.Timeout

function onCopyText() {
  navigator.clipboard.writeText(code)
    .then(() => {
      isCopied.value = true
    })
    .catch(() => {
      isCopied.value = false
    })
    .finally(() => {
      clearTimeout(resetTimerId)
      resetTimerId = setTimeout(() => {
        isCopied.value = false
      }, 1000)
    })
}
</script>

<template>
  <div class="pxd-code-block border rounded-lg overflow-hidden">
    <div v-if="filename" class="pxd-code-block--header flex justify-between items-center h-12 pl-4 pr-3 border-b bg-background-200">
      <div class="text-sm text-gray-900">
        <span>{{ filename }}</span>
      </div>

      <PButton variant="ghost" icon @click="onCopyText">
        <CheckIcon v-if="isCopied" class="text-green-700" />
        <CopyIcon v-else />
      </PButton>
    </div>

    <div class="pxd-code-block--body group relative">
      <PButton v-if="!filename" variant="outline" class="absolute right-3 top-3 hidden group-hover:block" icon @click="onCopyText">
        <CheckIcon v-if="isCopied" class="text-green-700" />
        <CopyIcon v-else />
      </PButton>

      <div class="rounded-inherit p-4 bg-background-100 font-mono" v-html="codeHtml" />
    </div>
  </div>
</template>
