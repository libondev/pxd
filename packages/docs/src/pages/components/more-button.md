<script setup>
  import { ref } from 'vue'

  const expanded = ref(false)
</script>

# MoreButton
Styling component to show expanded or collapsed content.

## Default

<PMoreButton v-model="expanded" />
<PMoreButton v-model="expanded" :button-props="{variant:'primary'}" />

```html
<PMoreButton v-model="expanded" />
<PMoreButton v-model="expanded" :button-props="{variant:'primary'}" />
```

## Texts
You can modify the button text by setting `lessText` and `moreText`.

<PMoreButton v-model="expanded" more-text="moreee" less-text="lessss" />
