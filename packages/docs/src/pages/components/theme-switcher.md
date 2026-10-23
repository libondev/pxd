# Theme Switcher

Component that toggles the theme between `auto` (follows the system preference) and `inverted` (shows the opposite of the system preference), with the icon reflecting the currently displayed scheme.

## Further

Put the following code in your `html > head`to ensure the correctness of the theme when the page is overloaded. (This is not necessary, it is only necessary to perform this operation when this kind of problem occurs.)

```js
(()=>{if(typeof window==='undefined')return;let p=matchMedia('(prefers-color-scheme:dark)').matches;let s=localStorage.getItem('fe.system.color-scheme')||'auto';if(s==='dark'||(s==='inverted'?!p:p&&s==='auto'))document.documentElement.classList.toggle('dark',true)})()
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

## Events

| Name | Type | Description |
| --- | --- | --- |
| toggle | `(scheme: ColorPreference) => void` | Emitted when the colour scheme preference changes. |
