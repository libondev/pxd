# Badge

A label that emphasizes an element that requires attention, or helps categorize with other similar elements.

## Default

```vue demo
<template>
  <PStack class="capitalize" gap="2">
    <PBadge variant="pill">pill</PBadge>
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
  <PStack>
    <PBadge size="sm">small</PBadge>
    <PBadge>medium(default)</PBadge>
    <PBadge size="lg">large</PBadge>
  </PStack>
</template>
```


## With Icons

```vue demo
<template>
  <PStack>
    <PBadge size="sm">
      <IconShield />
      Gray
    </PBadge>

    <PBadge>
      <IconShield />
      Gray
    </PBadge>

    <PBadge size="lg">
      <IconShield />
      Gray
    </PBadge>
  </PStack>
</template>
```

## As

```vue demo
<template>
  <PBadge as="RouterLink" href="#" variant="pill">
    pill
  </PBadge>
</template>
```
