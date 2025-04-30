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

## Badge

```vue demo
<script setup>
import LogoGithubIcon from 'gdsi/vue/logo-github'
</script>

<template>
  <PAvatar src="https://avatars.githubusercontent.com/u/6880091?v=4">
    <template #badge>
      <LogoGithubIcon />
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
