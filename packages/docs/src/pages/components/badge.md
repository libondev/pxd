<script setup>

</script>

# Badge
A label that emphasizes an element that requires attention, or helps categorize with other similar elements.

## Default

<PStack class="capitalize">
  <PBadge variant="gray">
    gray
  </PBadge>

  <PBadge variant="blue">
    blue
  </PBadge>

  <PBadge variant="purple">
    purple
  </PBadge>

  <PBadge variant="amber">
    amber
  </PBadge>

  <PBadge variant="red">
    red
  </PBadge>

  <PBadge variant="pink">
    pink
  </PBadge>

  <PBadge variant="green">
    green
  </PBadge>

  <PBadge variant="teal">
    teal
  </PBadge>

  <PBadge variant="inverted">
    inverted
  </PBadge>

  <PBadge variant="vue">
    vue
  </PBadge>

  <PBadge variant="trial">
    trial
  </PBadge>

  <PBadge variant="turborepo">
    turborepo
  </PBadge>
</PStack>

<PStack class="mt-2">
  <PBadge variant="gray-subtle">
    gray-subtle
  </PBadge>

  <PBadge variant="blue-subtle">
    blue-subtle
  </PBadge>

  <PBadge variant="purple-subtle">
    purple-subtle
  </PBadge>

  <PBadge variant="amber-subtle">
    amber-subtle
  </PBadge>

  <PBadge variant="red-subtle">
    red-subtle
  </PBadge>

  <PBadge variant="pink-subtle">
    pink-subtle
  </PBadge>

  <PBadge variant="green-subtle">
    green-subtle
  </PBadge>

  <PBadge variant="teal-subtle">
    teal-subtle
  </PBadge>
</PStack>

```html
<PBadge variant="gray"> gray </PBadge>
<PBadge variant="blue"> blue </PBadge>
<PBadge variant="purple"> purple </PBadge>
<PBadge variant="amber"> amber </PBadge>
<PBadge variant="red"> red </PBadge>
<PBadge variant="pink"> pink </PBadge>
<PBadge variant="green"> green </PBadge>
<PBadge variant="teal"> teal </PBadge>
<PBadge variant="gray-subtle"> gray-subtle </PBadge>
<PBadge variant="blue-subtle"> blue-subtle </PBadge>
<PBadge variant="purple-subtle"> purple-subtle </PBadge>
<PBadge variant="amber-subtle"> amber-subtle </PBadge>
<PBadge variant="red-subtle"> red-subtle </PBadge>
<PBadge variant="pink-subtle"> pink-subtle </PBadge>
<PBadge variant="green-subtle"> green-subtle </PBadge>
<PBadge variant="teal-subtle"> teal-subtle </PBadge>
<PBadge variant="inverted"> inverted </PBadge>
<PBadge variant="vue"> vue </PBadge>
<PBadge variant="trial"> trial </PBadge>
<PBadge variant="turborepo"> turborepo </PBadge>
```

## Sizes
<PStack>
  <PBadge size="sm">sm</PBadge>
  <PBadge size="md">md(default)</PBadge>
  <PBadge size="lg">lg</PBadge>
</PStack>

```html
<PBadge size="sm">sm</PBadge>
<PBadge size="md">md(default)</PBadge>
<PBadge size="lg">lg</PBadge>
```

## With Icons
<PStack>
  <PBadge size="sm">
    <IconShield />
    Gray
  </PBadge>

  <PBadge size="md">
    <IconShield />
    Gray
  </PBadge>

  <PBadge size="lg">
    <IconShield />
    Gray
  </PBadge>
</PStack>

```html
<PBadge size="sm">
  <ShieldIcon />
  Gray
</PBadge>

<PBadge size="md">
  <ShieldIcon />
  Gray
</PBadge>

<PBadge size="lg">
  <ShieldIcon />
  Gray
</PBadge>
```

## pill

<PBadge as="RouterLink" href="#" variant="pill">
  pill
</PBadge>

```html
<PBadge as="RouterLink" href="#" variant="pill">
  pill
</PBadge>
```
