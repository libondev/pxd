# Text

Display text using well-defined typographic styles.

## Default

```vue demo
<template>
  <PStack direction="vertical">
    <PText :dimension="48">The Evil Rabbit jumps.</PText>
    <PText :dimension="32">The Evil Rabbit jumps.</PText>
    <PText :dimension="24">The Evil Rabbit jumps.</PText>
    <PText :dimension="20">The Evil Rabbit jumps.</PText>
    <PText :dimension="16">The Evil Rabbit jumps.</PText>
    <PText :dimension="14">The Evil Rabbit jumps.</PText>
    <PText :dimension="12">The Evil Rabbit jumps.</PText>
  </PStack>
</template>
```

## Responsive

```vue demo
<template>
  <PText :dimension="{ sm: 24, md: 32, lg: 48 }">The Evil Rabbit jumps.</PText>
</template>
```

## Secondary

```vue demo
<template>
  <PText variant="secondary">The Evil Rabbit jumps.</PText>
</template>
```

## Align

```vue demo
<template>
  <PText align="left">The Evil Rabbit jumps.</PText>
  <PText align="center">The Evil Rabbit jumps.</PText>
  <PText align="right">The Evil Rabbit jumps.</PText>
</template>
```

## Monospace

```vue demo
<template>
  <PText>This is a sans-serif font.</PText>
  <PText monospace>This is a monospace font.</PText>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| as | `string \| object` | `p` | Tag or component rendered as the root element |
| text | `string` | - | Text content, also used as the `title` attribute |
| dimension | `string \| Responsive \| number` | - | Font size in `px`, or a responsive object keyed by breakpoint |
| align | `'left' \| 'center' \| 'right'` | `left` | Horizontal text alignment |
| monospace | `boolean` | - | Render with the monospace font |
| variant | `'default' \| 'secondary'` | `default` | Text color preset; `secondary` uses the secondary foreground color |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
