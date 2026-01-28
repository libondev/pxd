<script lang="ts" setup>
import type { ComponentOption } from 'pxd'
import { useCopyClick, useMessage, usePopoverResponsive } from 'pxd'

defineOptions({
  name: 'CustomVariables',
})

const { copyText } = useCopyClick()

const customVariables = ref({
  primary: '',
  radius: '',
  durations: '',
  timingFunction: '',
})

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
    ],
  },
  {
    key: 'radius',
    label: 'Radius',
    options: [
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
        value: '.7rem',
      },
    ],
  },
  {
    key: 'durations',
    label: 'Durations',
    options: [
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
    key: 'timingFunction',
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

const { isXs, attrs } = usePopoverResponsive()

watch(() => customVariables.value, (newVal) => {
  const rootElStyle = document.documentElement.style

  customProperties.forEach((property) => {
    rootElStyle.setProperty(`--${property.key}`, newVal[property.key])
  })
}, { deep: true })

function resetCustomVariables() {
  customVariables.value = {
    primary: '',
    radius: '',
    durations: '',
    timingFunction: '',
  }
}

async function copyCustomVariables() {
  await copyText(`
:root {
  --primary: ${customVariables.value.primary};
  --radius: ${customVariables.value.radius.trim()};
  --durations: ${customVariables.value.durations.trim()};
  --timing-function: ${customVariables.value.timingFunction.trim()};
}
`)

  useMessage.success('Copied to clipboard')
}
</script>

<template>
  <PPopover
    trigger="click"
    class="h-inherit"
    position="bottom-end"
    :unset-position="isXs"
    :wrapper-class="attrs.wrapperClass"
    :content-class="attrs.contentClass"
    :transition-type="attrs.transitionType"
    :lock-scroll-on-visible="isXs"
  >
    <slot />

    <template #content>
      <div class="p-3 gap-4 sm:w-64 flex flex-col">
        <div v-for="property in customProperties" :key="property.key">
          <PLabel>{{ property.label }}</PLabel>
          <PSwitchGroup v-model="customVariables[property.key]" :options="property.options" full-width />
        </div>

        <div class="gap-2 flex">
          <PButton class="flex-1" variant="ghost" @click="resetCustomVariables">
            Reset
          </PButton>

          <PButton class="flex-1" @click="copyCustomVariables">
            Copy
          </PButton>
        </div>
      </div>
    </template>
  </PPopover>
</template>
