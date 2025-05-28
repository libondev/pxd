<script lang="ts" setup>
import OverviewCard from '@/components/OverviewCard.vue'
import components from '@/consts/components.json'

const searchKeyword = ref('')

const filteredComponents = computed(() => {
  return components.filter(({ name }) => name.includes(searchKeyword.value.toLowerCase()))
})
</script>

<template>
  <h1 class="text-2xl font-medium">
    Overview
  </h1>

  <PText secondary class="mt-2">
    A total of <span class="font-medium text-foreground">{{ components.length }}</span> components
  </PText>

  <div class="py-4 sticky top-[49.5px] z-10 bg-background border-b">
    <PInput v-model="searchKeyword" placeholder="Search components" allow-clear />
  </div>

  <div class="flex flex-wrap gap-4 mt-4 md:-mr-4">
    <TransitionGroup name="collapse" mode="out-in">
      <template v-for="{ camelized, name } in filteredComponents" :key="name">
        <OverviewCard :name="camelized">
          There should be a preview here.
        </OverviewCard>
      </template>
    </TransitionGroup>
  </div>
</template>

<style lang="postcss">
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.2s ease;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  transform-origin: top;
  transform: scaleY(0.5);
}
</style>
