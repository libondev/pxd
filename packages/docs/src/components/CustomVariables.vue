<script lang="ts" setup>
import type { ComponentOption } from 'pxd'
import { useCopyClick, useMessage, usePopoverResponsive } from 'pxd'
import { ref, watch, onBeforeMount } from 'vue'

defineOptions({
  name: 'CustomVariables',
})

const { copyText } = useCopyClick()

interface CustomVariables {
  radius: string
  primary: string
  duration: string
  'timing-function': string
}

const STORAGE_KEY = 'fe.system.appearance'
const cachedVariables = localStorage.getItem(STORAGE_KEY) || '{}'
const parsedVariables: CustomVariables = JSON.parse(cachedVariables)

const customVariables = ref(parsedVariables)

interface CustomProperty {
  key: keyof typeof customVariables.value
  label: string
  options: ComponentOption[]
}

const customProperties = [
  {
    key: 'primary',
    label: 'Primary Color',
    options: [
      {
        label: 'Default',
        value: '',
      },
      {
        label: 'Blue',
        value: '212, 100%, 41%',
      },
      {
        label: 'Pink',
        value: '336, 74%, 51%',
      },
      {
        label: 'Teal',
        value: '173, 83%, 30%',
      },
    ],
  },
  {
    key: 'radius',
    label: 'Radius',
    options: [
      {
        label: 'None',
        value: '0',
      },
      {
        label: 'Small',
        value: '.4rem',
      },
      {
        label: 'Medium',
        value: '',
      },
      {
        label: 'Large',
        value: '1rem',
      },
    ],
  },
  {
    key: 'duration',
    label: 'Duration',
    options: [
      {
        label: 'None',
        value: '0',
      },
      {
        label: 'Fast',
        value: '',
      },
      {
        label: 'Medium',
        value: '.3s',
      },
      {
        label: 'Slow',
        value: '.5s',
      },
    ],
  },
  {
    key: 'timing-function',
    label: 'Timing Function',
    options: [
      {
        label: 'Linear',
        value: 'linear',
      },
      {
        label: 'Ease',
        value: '',
      },
      {
        label: 'Ease-out',
        value: 'ease-out',
      },
    ],
  },
] satisfies CustomProperty[]

const { isAdaptive, responsiveClasses } = usePopoverResponsive()

function updateCustomVariables() {
  const rootElStyle = document.documentElement.style

  customProperties.forEach((property) => {
    const newValue = customVariables.value[property.key]

    if (newValue) {
      rootElStyle.setProperty(`--${property.key}`, newValue)
    } else {
      rootElStyle.removeProperty(`--${property.key}`)
    }
  })
}

watch(
  () => customVariables.value,
  (newVal) => {
    updateCustomVariables()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
  },
  { deep: true },
)

const popoverVisible = ref(false)

function resetCustomVariables() {
  customVariables.value = {
    radius: '',
    primary: '',
    duration: '',
    'timing-function': '',
  }
  popoverVisible.value = false
}

async function copyCustomVariables() {
  await copyText(`
:root {
  --radius: ${customVariables.value.radius.trim() || '.5rem'};
  --primary: ${customVariables.value.primary || '0, 0%, 9%'};
  --duration: ${customVariables.value.duration.trim() || '.15s'};
  --timing-function: ${customVariables.value['timing-function'].trim() || 'ease-out'};
}
`)

  popoverVisible.value = false
  useMessage.success('Copied to clipboard', { group: 'website' })
}

onBeforeMount(() => {
  updateCustomVariables()
})
</script>

<template>
  <PPopover
    v-model="popoverVisible"
    trigger="click"
    class="h-inherit"
    position="bottom-end"
    :adaptive="isAdaptive"
    :wrapper-class="responsiveClasses.wrapper"
    :content-class="responsiveClasses.content"
    :lock-scroll-on-visible="isAdaptive"
  >
    <slot />

    <template #content>
      <div class="max-sm:p-4 p-3 gap-4 sm:w-72 flex flex-col">
        <div v-for="property in customProperties" :key="property.key">
          <PLabel>{{ property.label }}</PLabel>
          <PSwitch v-model="customVariables[property.key]" :options="property.options" full-width />
        </div>

        <div class="gap-2 flex">
          <PButton class="flex-1" @click="resetCustomVariables"> Reset </PButton>

          <PButton class="flex-1" variant="primary" @click="copyCustomVariables"> Copy </PButton>
        </div>
      </div>
    </template>
  </PPopover>
</template>
