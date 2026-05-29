# Project Banner

Used for temporary, project-wide notifications that require resolution

## default

```vue demo
<script setup>
import ShieldIcon from '@gdsicon/vue/shield'
</script>

<template>
  <PStack direction="vertical" class="w-full">
    <PProjectBanner variant="info" label="Attack Challenge Mode is enabled for this project">
      <template #icon>
        <ShieldIcon />
      </template>

      <template #action>
        <RouterLink to="/components/project-banner">Disable</RouterLink>
      </template>
    </PProjectBanner>

    <PProjectBanner variant="error" label="Attack Challenge Mode is enabled for this project">
      <template #icon>
        <ShieldIcon />
      </template>

      <template #action>
        <RouterLink to="/components/project-banner">Disable</RouterLink>
      </template>
    </PProjectBanner>

    <PProjectBanner variant="warning" label="Attack Challenge Mode is enabled for this project">
      <template #icon>
        <ShieldIcon />
      </template>

      <template #action>
        <RouterLink to="/components/project-banner">Disable</RouterLink>
      </template>
    </PProjectBanner>

    <PProjectBanner variant="success" label="Attack Challenge Mode is enabled for this project">
      <template #icon>
        <ShieldIcon />
      </template>

      <template #action>
        <RouterLink to="/components/project-banner">Disable</RouterLink>
      </template>
    </PProjectBanner>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string \| number \| null` | - | - |
| variant | `'warning' \| 'error' \| 'success' \| 'info'` | - | - |
