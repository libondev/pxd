<script lang="ts" setup>
import ArrowLeftIcon from '@gdsicon/vue/arrow-left'
import LockClosedIcon from '@gdsicon/vue/lock-closed'
import RefreshClockwiseIcon from '@gdsicon/vue/refresh-clockwise'
import { useCopyClick } from '../../composables/use-copy-click'
import PButton from '../button/index.vue'

interface Props {
  address?: string
}

defineOptions({
  name: 'PBrowser',
})

defineProps<Props>()

const { renderAs, onCopyClick } = useCopyClick()
</script>

<template>
  <div class="pxd-browser overflow-hidden rounded-md bg-background-200 shadow-border-small">
    <div class="py-2.5 px-5 gap-4 md:gap-6 flex justify-between bg-background-100">
      <div class="gap-4 min-w-0 md:first:max-w-[140px] md:last:max-w-[140px] flex flex-1 items-center justify-center max-md:first:flex-none first:justify-start last:justify-end">
        <div class="gap-2 flex items-center">
          <div class="w-3 h-3 rounded-full bg-[#FE5F57]" />
          <div class="w-3 h-3 rounded-full bg-[#FEBB2E]" />
          <div class="w-3 h-3 rounded-full bg-[#26C941]" />
        </div>

        <div class="gap-4 text-sm flex items-center text-gray-900 max-md:hidden">
          <ArrowLeftIcon />
          <ArrowLeftIcon class="rotate-180" />
          <RefreshClockwiseIcon />
        </div>
      </div>

      <div class="gap-4 min-w-0 md:first:max-w-[140px] md:last:max-w-[140px] flex flex-1 items-center justify-center max-md:first:flex-none first:justify-start last:justify-end">
        <div class="lg:max-w-xs pl-2.5 pr-1 py-1 flex w-full items-center justify-between rounded-full border border-gray-400 bg-background-200">
          <LockClosedIcon class="text-sm text-gray-900" />

          <div class="pl-1.5 min-w-0 flex-1 truncate text-center text-[13px] text-gray-1000">
            {{ address }}
          </div>

          <PButton variant="ghost" size="xs" shape="rounded" class="size-6" icon @click="onCopyClick(address)">
            <Transition name="pxd-transition--fade-scale" mode="out-in">
              <component :is="renderAs" class="text-sm" />
            </Transition>
          </PButton>
        </div>
      </div>

      <div class="gap-4 min-w-0 md:first:max-w-[140px] md:last:max-w-[140px] flex flex-1 items-center justify-center max-md:first:flex-none max-lg:hidden first:justify-start last:justify-end" />
    </div>

    <slot />
  </div>
</template>
