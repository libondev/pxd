<script lang="ts" setup>
import { usePopoverResponsive } from 'pxd/composables'

defineOptions({
  name: 'CustomVariables',
})

const customVariables = ref({
  radius: '.5rem',
  durations: '.15s',
  timingFunction: 'ease-out',
})

const { isXs, attrs } = usePopoverResponsive()

watch(() => customVariables.value, (newVal) => {
  const rootElStyle = document.documentElement.style

  rootElStyle.setProperty('--radius', newVal.radius)
  rootElStyle.setProperty('--default-transition-duration', newVal.durations)
  rootElStyle.setProperty('--default-transition-timing-function', newVal.timingFunction)
}, { deep: true })
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
        <div>
          <PLabel>Radius</PLabel>
          <PSwitchGroup v-model="customVariables.radius" full-width>
            <PSwitch label="Small" value=".4rem" />
            <PSwitch label="Medium" value=".5rem" />
            <PSwitch label="Large" value=".7rem" />
          </PSwitchGroup>
        </div>

        <div>
          <PLabel>Durations</PLabel>
          <PSwitchGroup v-model="customVariables.durations" full-width>
            <PSwitch label="Fast" value=".15s" />
            <PSwitch label="Medium" value=".3s" />
            <PSwitch label="Slow" value=".5s" />
          </PSwitchGroup>
        </div>

        <div>
          <PLabel>Timing Function</PLabel>
          <PSwitchGroup v-model="customVariables.timingFunction" full-width>
            <PSwitch label="Ease" value="ease" />
            <PSwitch label="Ease out" value="ease-out" />
            <PSwitch label="Ease in" value="ease-in" />
          </PSwitchGroup>
        </div>
      </div>
    </template>
  </PPopover>
</template>
