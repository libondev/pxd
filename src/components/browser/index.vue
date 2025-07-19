<script lang="ts" setup>
import ArrowLeftIcon from '@gdsicon/vue/arrow-left'
import LockClosedIcon from '@gdsicon/vue/lock-closed'
import RefreshClockwiseIcon from '@gdsicon/vue/refresh-clockwise'
import { useCopyClick } from '../../composables/useCopyClick'
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
  <div class="pxd-browser shadow-border-small rounded-md overflow-hidden bg-background-secondary">
    <div class="bg-background py-2.5 px-5 flex justify-between gap-4 md:gap-6">
      <div class="flex items-center flex-1 justify-center gap-4 min-w-0 first:justify-start md:first:max-w-[140px] max-md:first:flex-none last:justify-end md:last:max-w-[140px]">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-[#FE5F57]" />
          <div class="w-3 h-3 rounded-full bg-[#FEBB2E]" />
          <div class="w-3 h-3 rounded-full bg-[#26C941]" />
        </div>

        <div class="flex items-center gap-4 max-md:hidden text-sm text-gray-900">
          <ArrowLeftIcon />
          <ArrowLeftIcon class="rotate-180" />
          <RefreshClockwiseIcon />
        </div>
      </div>

      <div class="flex items-center flex-1 justify-center gap-4 min-w-0 first:justify-start md:first:max-w-[140px] max-md:first:flex-none last:justify-end md:last:max-w-[140px]">
        <div class="lg:max-w-xs bg-background-secondary border border-gray-400 w-full rounded-full pl-2.5 pr-1 py-1 flex items-center justify-between">
          <LockClosedIcon class="text-gray-900 text-sm" />

          <div class="pl-1.5 text-[13px] text-gray-1000 truncate flex-1 min-w-0 text-center truncate">
            {{ address }}
          </div>

          <PButton variant="ghost" size="xs" shape="rounded" class="size-6" icon @click="onCopyClick(address)">
            <Transition name="pxd-transition--fade-scale" mode="out-in">
              <component :is="renderAs" class="text-sm" />
            </Transition>
          </PButton>
        </div>
      </div>

      <div class="flex items-center flex-1 justify-center gap-4 min-w-0 first:justify-start md:first:max-w-[140px] max-md:first:flex-none last:justify-end md:last:max-w-[140px] max-lg:hidden" />
    </div>

    <slot />
  </div>
</template>
