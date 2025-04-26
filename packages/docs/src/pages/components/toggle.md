# Toggle
Switch between two values

<script setup>
  const isChecked = ref(false)
  const customValue = ref('closed')
</script>

## Default

<PToggle v-model="isChecked" />

```html
<PToggle v-model="isChecked" />
```

## Size

<div class="space-x-4">
  <PToggle v-model="isChecked" size="sm" />
  <PToggle v-model="isChecked" size="md" />
  <PToggle v-model="isChecked" size="lg" />
</div>

```html
<PToggle v-model="isChecked" />
```

## Custom Color

<PToggle v-model="isChecked" inactive-bg-color="hsl(var(--red-700-value))" active-bg-color="hsl(var(--green-700-value))" />

```html
<PToggle v-model="isChecked"  inactive-bg-color="hsl(var(--red-700-value))" active-bg-color="hsl(var(--green-700-value))" />
```

## With Label

<PToggle v-model="isChecked" inactive-label="Uncheck" active-label="Checked" />

```html
<PToggle v-model="isChecked" inactive-label="Uncheck" active-label="Checked" />
```

## Custom checked value
You can customize the selected and unselected values.

<PToggle v-model="customValue" inactive-label="Closed" active-label="Opened" inactive-value="closed" active-value="opened" />

```html
<PToggle v-model="isChecked" inactive-label="Closed" active-label="Opened" inactive-value="closed" active-value="opened" />
```
