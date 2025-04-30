# AvatarGroup
Show a team member or a group of people

## Default

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
