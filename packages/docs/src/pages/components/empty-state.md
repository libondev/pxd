# Empty State

Fill spaces when no content has been added yet, or is temporarily empty due to the nature of the feature and should be designed to prevent confusion.

## Default

```vue demo
<script setup>
import ChartBarPeak from '@gdsicon/vue/chart-bar-peak'
</script>

<template>
  <PEmptyState title="Title" description="A message conveying the state of the product.">
    <template #icon>
      <ChartBarPeak class="text-4xl" />
    </template>
  </PEmptyState>
</template>
```

## Informational

Help users by clearly explaining the benefit and utility of a product or feature, with a call to action and link to more information to help users progress.

Default to showing rather than telling the value of a feature. Certain entry points to a product may call for a unique empty state and a call to upgrade. Informational empty states will include a call to action.

```vue demo
<script setup>
import ChartBarPeak from '@gdsicon/vue/chart-bar-peak'
</script>

<template>
  <PEmptyState
    title="Title"
    description="This should detail the actions you can take on this screen, as well as why it’s valuable."
  >
    <template #icon>
      <ChartBarPeak class="text-4xl" />
    </template>

    <PButton>Primary Action</PButton>
    <PLinkButton type="text" external-icon class="w-max mx-auto" href="/"> Learn more </PLinkButton>
  </PEmptyState>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` | - | - |
| description | `string` | - | - |
