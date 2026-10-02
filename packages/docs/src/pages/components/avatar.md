# Avatar

Avatars represent a user or a team

## Default

```vue demo
<template>
  <PStack>
    <PAvatar src="https://avatars.githubusercontent.com/u/6880091?v=4" />
    <PAvatar src="https://avatars.githubusercontent.com/u/9113740?v=4" />
    <PAvatar src="https://avatars.githubusercontent.com/u/13041?v=4" />
  </PStack>
</template>
```

## Group

```vue demo
<script setup>
const options = [
  { src: 'https://avatars.githubusercontent.com/u/6880091?v=4' },
  { src: 'https://avatars.githubusercontent.com/u/9113740?v=4' },
  { src: 'https://avatars.githubusercontent.com/u/13041?v=4' },
  { src: 'https://avatars.githubusercontent.com/u/169298?v=4' },
  { src: 'https://avatars.githubusercontent.com/u/3676859?v=4' },
]
</script>

<template>
  <PAvatarGroup :options="options" :max="3" size="28" />
</template>
```

## Badge

```vue demo
<script setup>
import LogoGithubIcon from '@gdsicon/vue/logo-github'
</script>

<template>
  <PAvatar src="https://avatars.githubusercontent.com/u/6880091?v=4">
    <template #icon>
      <LogoGithubIcon />
    </template>
  </PAvatar>
</template>
```

## With custom icon

```vue demo
<script setup>
import ArrowCircleDownIcon from '@gdsicon/vue/arrow-circle-down'
import CheckCircleFillIcon from '@gdsicon/vue/check-circle-fill'
import ClockDashedIcon from '@gdsicon/vue/clock-dashed'
</script>

<template>
  <PStack direction="vertical">
    <PAvatar placeholder>
      <template #icon>
        <ArrowCircleDownIcon class="text-gray-900" />
      </template>
    </PAvatar>
    <PAvatar placeholder>
      <template #icon>
        <CheckCircleFillIcon class="text-gray-900" />
      </template>
    </PAvatar>
    <PAvatar placeholder>
      <template #icon>
        <ClockDashedIcon class="text-gray-900" />
      </template>
    </PAvatar>
  </PStack>
</template>
```

## Text Avatar

```vue demo
<template>
  <PAvatar alt="LT" />
</template>
```

## Loading

```vue demo
<template>
  <PAvatar src="https://avatars.githubusercontent.com/u/3676859?v=4" loading />
</template>
```

## Placeholder

```vue demo
<template>
  <PAvatar placeholder />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| src | `string` | - | URL of the image to display |
| alt | `string` | - | Image alt text, also used as the initials fallback |
| size | `number \| string` | - | Diameter in `px`, inherits the group size when nested |
| loading | `boolean` | - | Show a spinning ring over the avatar |
| placeholder | `boolean` | - | Render the shimmering placeholder instead of the image |

## Events

| Name | Type | Description |
| --- | --- | --- |
| load | `(event: Event) => void` | Emitted when the avatar image has finished loading. |
| error | `(event: Event) => void` | Emitted when the avatar image fails to load or its request is aborted. |
| loadstart | `(event: Event) => void` | Emitted when the avatar image starts loading. |

## AvatarGroup Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| max | `number` | `5` | Avatars shown before the `+N` counter appears |
| size | `number \| string` | - | Diameter in `px` applied to every avatar in the group |
| options | `AvatarOptions[]` | `() => []` | Avatars to render, each with `src`, `alt` and `loading` |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| getLoadingStatus | `() => AvatarStatus` | Return the current image loading status. |
