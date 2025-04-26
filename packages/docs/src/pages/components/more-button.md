# MoreButton
Styling component to show expanded or collapsed content.

## Basic
<script setup>
  const expanded = ref(false)
</script>

<PMoreButton v-model="expanded" />
<PMoreButton v-model="expanded" :button-props="{variant:'primary'}" />

```html
<PMoreButton v-model="expanded" />
<PMoreButton v-model="expanded" :button-props="{variant:'primary'}" />
```
