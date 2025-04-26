<script setup>
import OverviewCard from '@/components/OverviewCard.vue'
import { components } from '@/consts/components'

</script>

# Overview

<div class="flex flex-wrap gap-5">
  <template v-for="{name} in components" :key="name">
    <OverviewCard :name="name">
      {{ name }}
    </OverviewCard>
  </template>
</div>
