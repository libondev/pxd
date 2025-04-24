<script setup>
import * as components from 'pxd/components'
import OverviewCard from '@/components/OverviewCard.vue'

</script>

# Overview

<div class="flex flex-wrap gap-5">
  <template v-for="render, name in components" :key="name">
    <OverviewCard :name="name">
      {{ name }}
    </OverviewCard>
  </template>
</div>
