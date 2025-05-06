# ColorScheme
One-key switching system and light-dark theme of components

## Premise
Put the following code in your `html > head`to ensure the correctness of the theme when the page is overloaded.

```js
(function(){var p=matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches;var s=localStorage.getItem('fe.system.color-mode')||'auto';if(s==='dark'||(p&&s==='auto')){document.documentElement.classList.toggle('dark',true);}})()
```

## Default

```vue demo
<template>
  <PColorScheme />
</template>
```

## Variants/Shape

```vue demo
<template>
  <PStack>
    <PColorScheme variant="primary" />
    <PColorScheme shape="rounded" />
  </PStack>
</template>
```
