# Checkerboard

Display a checkerboard pattern background, commonly used to indicate transparency.

## Default

```vue demo
<template>
  <PCheckerboard class="h-40 rounded-lg" />
</template>
```

## Custom Size

```vue demo
<template>
  <PCheckerboard :size="40" class="h-40 rounded-lg" />
</template>
```

## Custom Colors

```vue demo
<template>
  <PCheckerboard primary-color="#e879f9" background-color="#f0abfc" class="h-40 rounded-lg" />
</template>
```

## With Content

```vue demo
<template>
  <PCheckerboard class="h-40 rounded-lg flex items-center justify-center">
    <span class="text-lg font-bold">Transparent Area</span>
  </PCheckerboard>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `string \| number` | `20` | Size of each checkerboard cell |
| primary-color | `string` | `var(--color-background-200)` | Primary (lighter) color |
| background-color | `string` | `var(--color-background-100)` | Background (darker) color |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
