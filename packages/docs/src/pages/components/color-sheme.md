<script setup>

</script>

# ColorScheme
One-key switching system and light-dark theme of components

## Premise
Put the following code in your `html > head` to ensure the correctness of the theme when the page is overloaded.

```js
(function(){const p=matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches;const s=localStorage.getItem('fe.system.color-mode')||'auto';if(s==='dark'||(p&&s==='auto')){document.documentElement.classList.toggle('dark',true);}})()
```

## Basic

<PColorScheme />

## Variants/Shape

<PStack>
  <PColorScheme variant="primary" />
  <PColorScheme shape="rounded" />
</PStack>
