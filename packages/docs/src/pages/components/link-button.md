# LinkButton
Inherit button style links.

## Default

```vue demo
<template>
  <PStack>
    <PLinkButton href="/components/link-button" text="text prop button" />
    <PLinkButton href="/components/link-button">
      slot button
    </PLinkButton>
  </PStack>
</template>
```

## Text Link
Set `type="text"` to convert it into a link in normal text form.

```vue demo
<template>
  <PStack>
    <PLinkButton href="/components/link-button" text="text prop button" type="text" />
  </PStack>
</template>
```

## Sizes

```vue demo
<template>
  <PStack>
    <PLinkButton size="sm" href="/components/link-button">
      sm
    </PLinkButton>
    <PLinkButton size="md" href="/components/link-button">
      md(default)
    </PLinkButton>
    <PLinkButton size="lg" href="/components/link-button">
      lg
    </PLinkButton>
  </PStack>
</template>
```

## Variant

```vue demo
<template>
  <PStack>
    <PLinkButton variant="ghost" href="/components/link-button">
      ghost link
    </PLinkButton>

    <PLinkButton variant="primary" href="/components/link-button">
      primary link
    </PLinkButton>
  </PStack>
</template>
```


## Shape

```vue demo
<template>
  <PLinkButton shape="rounded" href="/components/link-button">
    rounded link
  </PLinkButton>
</template>
```
