<template>
  <Section
    title="Scroller"
    description="Display an overflowing list of items."
  />

  <Section title="Vertical">
    <Preview>
      <PScroller class="h-80 w-80">
        <div class="w-screen h-screen flex flex-wrap gap-4">
          <div v-for="item of 20" :key="item" class="w-48 h-48 w-full bg-gray-1000">
            {{ item }}
          </div>
        </div>
      </PScroller>
    </Preview>
  </Section>
</template>
