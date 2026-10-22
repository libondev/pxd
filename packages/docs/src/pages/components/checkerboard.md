# Checkerboard

Display a checkerboard pattern background, commonly used to indicate transparency.

## Default

```vue demo
<template>
  <PCheckerboard class="h-40 rounded-lg" />
</template>
```

## Variants

```vue demo
<template>
  <div class="grid grid-cols-2 gap-4">
    <PCheckerboard variant="grid" class="h-40" />
    <PCheckerboard variant="dots" class="h-40" primary-color="var(--color-gray-500)" />
  </div>
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
| variant | `'checkerboard' \| 'grid' \| 'dots'` | `'checkerboard'` | Pattern variant: checkerboard, grid lines, or dot background |
| size | `string \| number` | `20` | Size of each pattern cell |
| primary-color | `string` | `var(--color-gray-200)` | Primary (darker) color |
| background-color | `string` | `var(--color-background-100)` | Background (lighter) color |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
