
# Theme Switcher
Component that allows users to switch between light and dark themes.

## Further
Put the following code in your `html > head`to ensure the correctness of the theme when the page is overloaded. (This is not necessary, it is only necessary to perform this operation when this kind of problem occurs.)

```js
(function(){if(typeof window === 'undefined')return;let p=matchMedia('(prefers-color-scheme:dark)').matches;let s=localStorage.getItem('fe.system.color-scheme')||'auto';if(s==='dark'||(p&&s==='auto')){document.documentElement.classList.toggle('dark',true);}})()
```

## Default
Support all attributes of the [button](/components/button) component (except slots)

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
