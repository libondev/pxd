# Dash Line

Use controllable forms to create beautiful solid or dotted lines.

## Default

```vue demo
<template>
  <PDashLine class="h-px" />
</template>
```

## Position

```vue demo
<template>
  <div class="w-full h-10 flex flex-col">
    <PDashLine class="h-px" position="top" />

    <PDashLine class="h-4 flex-1" :position="['left', 'right']" />

    <PDashLine class="h-px" position="bottom" />
  </div>
</template>
```

## Dash and Gap

```vue demo
<template>
  <PStack class="w-full h-10">
    <PDashLine class="h-px" dash-size="10" gap="0" />

    <PDashLine class="h-px" dash-size="10" gap="5" />

    <PDashLine class="h-px" dash-size="5" gap="20" />
  </PStack>
</template>
```

## Color

```vue demo
<template>
  <PStack class="w-full h-10">
    <PDashLine class="h-px" color="var(--color-red-700)" />

    <PDashLine class="h-px" color="var(--color-blue-700)" />

    <PDashLine class="h-px" color="var(--color-gray-700)" />
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| position | `BasePosition \| BasePosition[]` | `() => ['top']` | - |
| line-size | `string \| number` | - | - |
| dash-size | `string \| number` | - | - |
| color | `string` | - | - |
| gap | `string \| number` | - | - |
