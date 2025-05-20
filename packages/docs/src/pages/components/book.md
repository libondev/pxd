# Book
A responsive book component.

## Default

```vue demo
<template>
  <PBook title="The user experience of the Frontend Cloud" />
</template>
```

## Variants

```vue demo
<template>
  <PStack gap="8">
    <PBook
      title="The user experience of the Frontend Cloud"
      variant="simple"
    />
    <PBook
      title="The user experience of the Frontend Cloud"
      variant="stripe"
    />
  </PStack>
</template>
```

## Custom color

```vue demo
<template>
  <PStack gap="8">
    <PBook
      color="#9D2127"
      title="How Vercel improves your website's search engine ranking"
    />
    <PBook
      color="#7DC1C1"
      title="Design Engineering at Vercel"
      class="text-white"
      variant="simple"
    />
    <PBook
      color="#FED954"
      title="The user experience of the Frontend Cloud"
    />
  </PStack>
</template>
```

## Custom illustration

```vue demo
<script setup>
import Alpha from '@gdsicon/vue/alpha'
</script>

<template>
  <PStack gap="8">
    <PBook
      color="#9D2127"
      title="The user experience of the Frontend Cloud"
    >
      <template #illustration>
        <svg fill="none" viewBox="0 0 197 149" width="197" height="149" xmlns="http://www.w3.org/2000/svg"><rect fill="#FED954" height="149" width="197"></rect><path d="M147 48.4995H172C185.531 48.4995 196.5 59.4685 196.5 72.9995V148.427" stroke="#ECAF14"></path><path d="M0 48.5H24.5C38.031 48.5 49 37.531 49 24V0" stroke="#ECAF14"></path><path d="M147.5 48.5H172C185.531 48.5 196.5 37.531 196.5 24V0" stroke="#ECAF14"></path><path d="M0 48.5H24.5C38.031 48.5 49 59.469 49 73V98" stroke="#ECAF14"></path><path d="M146 48.5H73.5C59.969 48.5 49 37.531 49 24V0" stroke="#ECAF14"></path><path d="M196 48.5H122.5C108.969 48.5 98 37.531 98 24V0" stroke="#ECAF14"></path><path d="M97 48.5H73.5C59.969 48.5 49 59.469 49 73V99.5" stroke="#ECAF14"></path><path d="M98 132.5H122.5C136.031 132.5 147 121.531 147 108V98.9512" stroke="#ECAF14"></path><path d="M196 132.5H171.5C157.969 132.5 147 121.531 147 108V48.5" stroke="#ECAF14"></path><path d="M147 48.5H122.5C108.969 48.5 98 59.469 98 73V132" stroke="#ECAF14"></path><path d="M98 132.5H73.5C59.969 132.5 49 121.531 49 108V98.9512" stroke="#ECAF14"></path></svg>
      </template>
    </PBook>
    <PBook
      color="#7DC1C1"
      title="Design Engineering at Vercel"
      class="text-white"
      variant="simple"
    >
      <template #illustration>
        <Alpha class="text-2xl" />
      </template>
    </PBook>
  </PStack>
</template>
```

## Width

```vue demo
<template>
  <PStack gap="8" align="end">
    <PBook
      title="The user experience of the Frontend Cloud"
      width="300"
    />
    <PBook
      title="The user experience of the Frontend Cloud"
      width="200"
    />
    <PBook
      title="The user experience of the Frontend Cloud"
      width="150"
    />
  </PStack>
</template>
```

## Textured

```vue demo
<template>
  <PStack gap="8">
    <PBook
      title="The user experience of the Frontend Cloud"
      variant="simple"
      textured
    />
    <PBook
      title="The user experience of the Frontend Cloud"
      variant="stripe"
      textured
    />
  </PStack>
</template>
```
