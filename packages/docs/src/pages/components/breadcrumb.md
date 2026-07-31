# Breadcrumb

Displays the current page hierarchy and lets users navigate to parent routes.

## Default

Use `PBreadcrumbItem` for each level. Set `to` on items that should navigate; the final item usually represents the current page and does not need a link.

```vue demo
<template>
  <PBreadcrumb>
    <PBreadcrumbItem to="/">Home</PBreadcrumbItem>
    <PBreadcrumbItem to="/guide/components">Components</PBreadcrumbItem>
    <PBreadcrumbItem>Breadcrumb</PBreadcrumbItem>
  </PBreadcrumb>
</template>
```

## Separator

Set `separator` to use a custom character. Set `separator-icon` to render an icon instead; it takes precedence over `separator`.

```vue demo
<script setup>
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
</script>

<template>
  <div class="flex flex-col gap-3">
    <PBreadcrumb separator=">">
      <PBreadcrumbItem to="/">Home</PBreadcrumbItem>
      <PBreadcrumbItem to="/guide/components">Components</PBreadcrumbItem>
      <PBreadcrumbItem>Breadcrumb</PBreadcrumbItem>
    </PBreadcrumb>

    <PBreadcrumb :separator-icon="ChevronRightIcon">
      <PBreadcrumbItem to="/">Home</PBreadcrumbItem>
      <PBreadcrumbItem to="/guide/components">Components</PBreadcrumbItem>
      <PBreadcrumbItem>Breadcrumb</PBreadcrumbItem>
    </PBreadcrumb>
  </div>
</template>
```

## Replace Navigation

Use `replace` to navigate with `RouterLink` without creating a new browser history entry.

```vue demo
<template>
  <PBreadcrumb>
    <PBreadcrumbItem to="/" replace>Home</PBreadcrumbItem>
    <PBreadcrumbItem to="/guide/components">Components</PBreadcrumbItem>
    <PBreadcrumbItem>Breadcrumb</PBreadcrumbItem>
  </PBreadcrumb>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| separator | `string` | `'/'` | Character rendered between items. |
| separator-icon | `string \| Component` | - | Icon rendered between items. Overrides `separator`. |

## BreadcrumbItem Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| to | `string \| object` | - | Target route passed to the global `RouterLink`. |
| replace | `boolean` | `false` | Replaces the current history entry when navigating. |

## Slots

| Name | Description |
| --- | --- |
| default | Breadcrumb items. |

## BreadcrumbItem Slots

| Name | Description |
| --- | --- |
| default | Content for the breadcrumb item. |
