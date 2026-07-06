# Badge

A label that emphasizes an element that requires attention, or helps categorize with other similar elements.

## Default

```vue demo
<template>
  <PStack class="capitalize" gap="2">
    <PBadge variant="pill">pill</PBadge>
    <PBadge variant="primary">primary</PBadge>
    <PBadge variant="secondary">secondary</PBadge>
    <PBadge variant="gray">gray</PBadge>
    <PBadge variant="blue">blue</PBadge>
    <PBadge variant="purple">purple</PBadge>
    <PBadge variant="amber">amber</PBadge>
    <PBadge variant="red">red</PBadge>
    <PBadge variant="pink">pink</PBadge>
    <PBadge variant="green">green</PBadge>
    <PBadge variant="teal">teal</PBadge>
    <PBadge variant="inverted">inverted</PBadge>
    <PBadge variant="vue">vue</PBadge>
    <PBadge variant="trial">trial</PBadge>
    <PBadge variant="turborepo">turborepo</PBadge>
  </PStack>

  <PStack class="mt-2 capitalize" gap="2">
    <PBadge variant="gray-subtle">gray-subtle</PBadge>
    <PBadge variant="blue-subtle">blue-subtle</PBadge>
    <PBadge variant="purple-subtle">purple-subtle</PBadge>
    <PBadge variant="amber-subtle">amber-subtle</PBadge>
    <PBadge variant="red-subtle">red-subtle</PBadge>
    <PBadge variant="pink-subtle">pink-subtle</PBadge>
    <PBadge variant="green-subtle">green-subtle</PBadge>
    <PBadge variant="teal-subtle">teal-subtle</PBadge>
  </PStack>
</template>
```

## Sizes

```vue demo
<template>
  <PStack align="center">
    <PBadge size="sm">Small</PBadge>
    <PBadge>Medium</PBadge>
    <PBadge size="lg">Large</PBadge>
  </PStack>
</template>
```

## Closeable

```vue demo
<script setup>
function onClose() {
  console.log('close')
}
</script>

<template>
  <PStack align="center">
    <PBadge variant="pill" closeable @close="onClose" size="sm">Small</PBadge>
    <PBadge variant="pill" closeable @close="onClose">Medium</PBadge>
    <PBadge variant="pill" closeable @close="onClose" size="lg">Large</PBadge>
  </PStack>
</template>
```

## With Icons

```vue demo
<template>
  <PStack align="center">
    <PBadge size="sm">
      <IconShield />
      Badge
    </PBadge>

    <PBadge>
      <IconShield />
      Badge
    </PBadge>

    <PBadge size="lg">
      <IconShield />
      Badge
    </PBadge>
  </PStack>
</template>
```

## As

```vue demo
<template>
  <PBadge as="RouterLink" to="/components/badge"> pill </PBadge>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| as | `string \| object` | `span` | - |
| href | `string` | - | - |
| size | `'sm' \| 'md' \| 'lg'` | - | - |
| variant | `BadgeVariant` | `pill` | - |
| closeable | `boolean` | - | - |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
