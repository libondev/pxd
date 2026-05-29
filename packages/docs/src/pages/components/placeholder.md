# Placeholder

Indicates that it is not empty here.

## Default

The color of the placeholder is controlled by the font color.

```vue demo
<template>
  <PPlaceholder color="var(--color-gray-300)" class="h-24"></PPlaceholder>
</template>
```

## Size

Set `gap` to adjust the spacing between lines. (default unit: px)

```vue demo
<template>
  <PPlaceholder color="var(--color-gray-300)" class="h-24 w-full mb-4" gap="12px"></PPlaceholder>
  <PPlaceholder color="var(--color-gray-300)" class="h-24 w-full" gap="18"></PPlaceholder>
</template>
```

## Invert

Customize its size and line color.

```vue demo
<template>
  <PPlaceholder color="var(--color-gray-300)" class="h-24" invert></PPlaceholder>
</template>
```

## Custom

Customize its size and line color.

```vue demo
<template>
  <PPlaceholder
    color="var(--color-red-500)"
    class="w-40 h-40 border border-dashed border-green-600 rounded-lg"
  ></PPlaceholder>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| gap | `number \| string` | - | - |
| color | `string` | - | - |
| invert | `boolean` | - | - |
