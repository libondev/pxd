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
  <PAvatarGroup :options="options" :max="3" />
</template>
```


## Badge

```vue demo
<script setup>
import LogoGithubIcon from '@gdsicon/vue/logo-github'
</script>

<template>
  <PAvatar src="https://avatars.githubusercontent.com/u/6880091?v=4">
    <template #badge>
      <!-- fix dark mode icon color -->
      <LogoGithubIcon class="text-black" />
    </template>
  </PAvatar>
</template>
```

## Loading

```vue demo
<template>
  <PAvatar loading />
</template>
```
