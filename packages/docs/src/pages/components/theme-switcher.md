
# ThemeSwitcher
Component that allows users to switch between light and dark themes.

## Premise
Put the following code in your `html > head`to ensure the correctness of the theme when the page is overloaded.

```js
(function(){if(typeof window === 'undefined')return;let p=matchMedia('(prefers-color-scheme: dark)').matches;let s=localStorage.getItem('fe.system.color-mode')||'auto';if(s==='dark'||(p&&s==='auto')){document.documentElement.classList.toggle('dark',true);}})()
```

## Default

```vue demo
<template>
  <PThemeSwitcher />
</template>
```

## Variants/Shape

```vue demo
<template>
  <PStack>
    <PThemeSwitcher variant="primary" />
    <PThemeSwitcher shape="rounded" />
  </PStack>
</template>
```
