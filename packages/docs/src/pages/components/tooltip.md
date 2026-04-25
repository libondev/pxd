# Tooltip

Display prompt information for mouse hover.

## Default

The component inherits from popover and supports all the properties of popover. For details, See: [Popover](/components/popover).

```vue demo
<template>
  <PStack>
    <PTooltip position="left" content="The Evil Rabbit Jumped over the Fence">
      <PButton>Hover me</PButton>
    </PTooltip>

    <PTooltip position="top" trigger="click" content="The Evil Rabbit Jumped over the Fence">
      <PButton>Click me</PButton>
    </PTooltip>

    <PTooltip position="bottom" trigger="focus" content="The Evil Rabbit Jumped over the Fence">
      <PButton>Focus me</PButton>
    </PTooltip>

    <PTooltip
      position="right"
      trigger="contextmenu"
      content="The Evil Rabbit Jumped over the Fence"
    >
      <PButton>Rightclick me</PButton>
    </PTooltip>
  </PStack>
</template>
```

## Variant

```vue demo
<template>
  <PStack>
    <PTooltip variant="invert" content="The Evil Rabbit Jumped over the Fence">
      <PButton>invert</PButton>
    </PTooltip>

    <PTooltip variant="primary" content="The Evil Rabbit Jumped over the Fence">
      <PButton>primary</PButton>
    </PTooltip>

    <PTooltip variant="success" content="The Evil Rabbit Jumped over the Fence">
      <PButton>success</PButton>
    </PTooltip>

    <PTooltip variant="warning" content="The Evil Rabbit Jumped over the Fence">
      <PButton>warning</PButton>
    </PTooltip>

    <PTooltip variant="error" content="The Evil Rabbit Jumped over the Fence">
      <PButton>error</PButton>
    </PTooltip>

    <PTooltip variant="violet" content="The Evil Rabbit Jumped over the Fence">
      <PButton>violet</PButton>
    </PTooltip>
  </PStack>
</template>
```

## Non interactive

Set `interactive=false` to control the popup content to be non-interactive

```vue demo
<script setup>
const content = 'Do not go gentle into that good night, rage, rage against the dying of the light.'
</script>

<template>
  <PTooltip variant="success" :interactive="false">
    <PButton> Hover me </PButton>

    <template #content>
      {{ content }}
    </template>
  </PTooltip>
</template>
```

## Delay

```vue demo
<template>
  <PStack>
    <PTooltip :show-delay="0" :hide-delay="0" content="The Evil Rabbit Jumped over the Fence">
      <PButton>0ms</PButton>
    </PTooltip>

    <PTooltip content="The Evil Rabbit Jumped over the Fence">
      <PButton>300ms(default)</PButton>
    </PTooltip>

    <PTooltip :show-delay="200" :hide-delay="400" content="The Evil Rabbit Jumped over the Fence">
      <PButton>Show: 200ms, Hide: 400ms</PButton>
    </PTooltip>
  </PStack>
</template>
```

## No arrow

```vue demo
<script setup>
const content = 'Do not go gentle into that good night, rage, rage against the dying of the light.'
</script>

<template>
  <PTooltip :content="content" :show-arrow="false">
    <PButton> Hover to active </PButton>
  </PTooltip>
</template>
```

## Custom content

```vue demo
<template>
  <PTooltip>
    <PButton>Hover me</PButton>

    <template #content> The <b>Evil Rabbit</b> Jumped over the <i>Fence</i>. </template>
  </PTooltip>
</template>
```

## Components

```vue demo
<template>
  <PStack align="center" gap="8">
    <PTooltip content="The Evil Rabbit Jumped over the Fence">
      <PCheckbox label="Checkbox" />
    </PTooltip>

    <PTooltip content="The Evil Rabbit Jumped over the Fence">
      <PBadge>LEFT</PBadge>
    </PTooltip>

    <PTooltip content="The Evil Rabbit Jumped over the Fence">
      <PSpinner />
    </PTooltip>
  </PStack>
</template>
```

## DesktopOnly

```vue demo
<template>
  <PTooltip content="The Evil Rabbit Jumped over the Fence" desktop-only>
    <PButton>Only show on desktop</PButton>
  </PTooltip>
</template>
```
