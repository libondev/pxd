# Scalable Text

Adaptive text size according to the maximum width, common in internationalized text.

## Default

```vue demo
<template>
  <div class="p-1 border rounded-md min-w-25 h-100 w-64 border-dashed flex flex-col gap-3 bg-background-200 overflow-hidden resize-x">
    <PScalableText text="邪恶的兔子跳过了栅栏" />
    <PScalableText text="邪悪なウサギが栅を飛び越えた" />
    <PScalableText text="The Evil Rabbit Jumped over the Fence" />
    <PScalableText text="Coelhos malignos saltaram pela cerca" />
    <PScalableText text="Le lapin maléfique saute au-dessus de la clôture" />
  </div>
</template>
```

## Min Font Size

Set a minimum font size below which the text will be allowed to wrap instead of continuing to shrink.

```vue demo
<template>
  <div class="p-1 border rounded-md min-w-25 h-100 w-64 border-dashed flex flex-col gap-3 bg-background-200 overflow-hidden resize-x">
    <PScalableText text="The Evil Rabbit Jumped over the Fence" :min-font-size="12" />
    <PScalableText text="The Evil Rabbit Jumped over the Fence" :min-font-size="14" />
    <PScalableText text="The Evil Rabbit Jumped over the Fence" :min-font-size="16" />
  </div>
</template>
```
