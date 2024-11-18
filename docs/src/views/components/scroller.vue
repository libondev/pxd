<template>
  <Section
    title="Scroller"
    description="Display an overflowing list of items."
  />

  <Section title="Vertical">
    <div class="flex items-center gap-4 bg-background-100 p-4">
      <PScroller class="h-80 w-80">
        <div class="w-screen h-screen flex flex-wrap gap-4">
          <div v-for="item of 20" :key="item" class="w-48 h-48 w-full bg-gray-100">
            {{ item }}
          </div>
        </div>
      </PScroller>
    </div>
  </Section>
</template>
