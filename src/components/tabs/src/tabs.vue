<script setup lang="ts">
import {
  TabsList,
  TabsRoot,
  TabsTrigger,
} from 'radix-vue'
import { TriggerSymbol, type Triggers } from '..'
import type { Size } from '@/types'

defineProps({
  size: {
    type: String as PropType<Size>,
    default: 'default',
  },
  label: {
    type: String,
    default: '',
  },
})

const triggers = ref<Triggers>({})

const checkState = defineModel<string>()

const SIZES = {
  sm: {
    track: 'p-1 rounded-md',
    inner: 'px-2 py-1 rounded-sm',
  },
  default: {
    track: 'p-1 rounded-md',
    inner: 'px-4 py-1.5 rounded-sm text-sm',
  },
  lg: {
    track: 'p-1.5 rounded-lg',
    inner: 'px-5 py-2.5 rounded-md text-4',
  },
}

provide(TriggerSymbol, triggers)
</script>

<template>
  <TabsRoot v-model="checkState" activation-mode="manual">
    <TabsList
      :aria-label="label"
      class="box-border flex w-full group items-center justify-center bg-muted text-muted-foreground"
      :class="SIZES[size].track"
    >
      <TabsTrigger
        v-for="value, text in triggers"
        :key="value"
        :value="value"
        class="b-0 flex-1 py-0 box-border bg-transparent h-full text-foreground font-inherit group-hover:transition-background-color data-[active=true]:(bg-background shadow-sm)"
        :class="SIZES[size].inner"
      >
        {{ text }}
      </TabsTrigger>
    </TabsList>

    <slot />
  </TabsRoot>
</template>
