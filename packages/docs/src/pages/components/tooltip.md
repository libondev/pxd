# Tooltip
Display prompt information for mouse hover.

## Default
The component inherits from popover and supports all the properties of popover. For details, See: [Popover](#/components/popover).

```vue demo
<template>
  <PStack>
    <PTooltip
      position="left"
      content="The Evil Rabbit Jumped over the Fence"
    >
      <PButton>Hover me</PButton>
    </PTooltip>

    <PTooltip
      position="top"
      content="The Evil Rabbit Jumped over the Fence"
    >
      <PButton>Hover me</PButton>
    </PTooltip>

    <PTooltip
      position="bottom"
      content="The Evil Rabbit Jumped over the Fence"
    >
      <PButton>Hover me</PButton>
    </PTooltip>

    <PTooltip
      position="right"
      content="The Evil Rabbit Jumped over the Fence"
    >
      <PButton>Hover me</PButton>
    </PTooltip>
  </PStack>
</template>
```

## Delay

```vue demo
<template>
  <PStack>
    <PTooltip
      :show-delay="0"
      :hide-delay="0"
      content="The Evil Rabbit Jumped over the Fence"
    >
      <PButton>0ms</PButton>
    </PTooltip>

    <PTooltip
      content="The Evil Rabbit Jumped over the Fence"
    >
      <PButton>300ms(default)</PButton>
    </PTooltip>

    <PTooltip
      :show-delay="100"
      :hide-delay="400"
      content="The Evil Rabbit Jumped over the Fence"
    >
      <PButton>Show: 100ms, Hide: 400ms</PButton>
    </PTooltip>
  </PStack>
</template>
```

## Custom content

```vue demo
<template>
  <PStack>
    <PTooltip
      :delay="0"
      position="left"
    >
      <PButton>Hover me</PButton>

      <template #content>
        The <b>Evil Rabbit</b> Jumped over the <i>Fence</i>.
      </template>
    </PTooltip>

    <PTooltip
      :delay="0"
      position="top"
    >
      <PButton>Hover me</PButton>
      <template #content>
        The <b>Evil Rabbit</b> Jumped over the <i>Fence</i>.
      </template>
    </PTooltip>

    <PTooltip
      :delay="0"
      position="bottom"
     >
      <PButton>Hover me</PButton>
      <template #content>
        The <b>Evil Rabbit</b> Jumped over the <i>Fence</i>.
      </template>
    </PTooltip>

    <PTooltip
      :delay="0"
      position="right"
    >
      <PButton>Hover me</PButton>
      <template #content>
        The <b>Evil Rabbit</b> Jumped over the <i>Fence</i>.
      </template>
    </PTooltip>
  </PStack>
</template>
```

## Custom type

```vue demo
<template>
  <PStack>
    <PTooltip
      variant="primary"
      position="left"
      content="The Evil Rabbit Jumped over the Fence"
    >
      <PButton>Hover me</PButton>
    </PTooltip>

    <PTooltip
      variant="success"
      position="top"
      content="The Evil Rabbit Jumped over the Fence"
    >
      <PButton>Hover me</PButton>
    </PTooltip>

    <PTooltip
      variant="warning"
      position="bottom"
      content="The Evil Rabbit Jumped over the Fence"
     >
      <PButton>Hover me</PButton>
    </PTooltip>

    <PTooltip
      variant="error"
      position="right"
      content="The Evil Rabbit Jumped over the Fence"
    >
      <PButton>Hover me</PButton>
    </PTooltip>
  </PStack>
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

## Other

```vue demo
<template>
  <PStack align="center" gap="8">
    <PTooltip content="The Evil Rabbit Jumped over the Fence" :show-arrow="false">
      <PButton>No arrow</PButton>
    </PTooltip>

    <PTooltip content="The Evil Rabbit Jumped over the Fence" desktop-only>
      <PButton>Only show on desktop</PButton>
    </PTooltip>
  </PStack>
</template>
```
