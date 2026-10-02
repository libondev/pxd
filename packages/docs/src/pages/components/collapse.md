# Collapse

A set of headings, vertically stacked, that each reveal an related section of content. Commonly referred to as an accordion.

## Default

```vue demo
<template>
  <PCollapseGroup>
    <PCollapse title="Question A">
      <div class="mb-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias
        debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque
        facere ea, hic incidunt necessitatibus.
      </div>
    </PCollapse>

    <PCollapse title="Question B">
      <div class="mb-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias
        debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque
        facere ea, hic incidunt necessitatibus.
      </div>
    </PCollapse>
  </PCollapseGroup>
</template>
```

## Expanded

```vue demo
<template>
  <PCollapseGroup>
    <PCollapse expand title="Question A">
      <div class="mb-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias
        debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque
        facere ea, hic incidunt necessitatibus.
      </div>
    </PCollapse>

    <PCollapse title="Question B">
      <div class="mb-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias
        debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque
        facere ea, hic incidunt necessitatibus.
      </div>
    </PCollapse>
  </PCollapseGroup>
</template>
```

## Multiple

```vue demo
<template>
  <PCollapseGroup multiple>
    <PCollapse title="Question A">
      <div class="mb-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias
        debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque
        facere ea, hic incidunt necessitatibus.
      </div>
    </PCollapse>

    <PCollapse title="Question B">
      <div class="mb-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias
        debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque
        facere ea, hic incidunt necessitatibus.
      </div>
    </PCollapse>
  </PCollapseGroup>
</template>
```

## Sizes

```vue demo
<template>
  <PStack direction="vertical" gap="8">
    <PCollapseGroup size="sm">
      <PCollapse title="Question A">
        <div class="mb-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae
          alias debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non
          doloremque facere ea, hic incidunt necessitatibus.
        </div>
      </PCollapse>

      <PCollapse title="Question B">
        <div class="mb-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae
          alias debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non
          doloremque facere ea, hic incidunt necessitatibus.
        </div>
      </PCollapse>
    </PCollapseGroup>

    <PCollapseGroup size="md">
      <PCollapse title="Question A">
        <div class="mb-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae
          alias debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non
          doloremque facere ea, hic incidunt necessitatibus.
        </div>
      </PCollapse>

      <PCollapse title="Question B">
        <div class="mb-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae
          alias debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non
          doloremque facere ea, hic incidunt necessitatibus.
        </div>
      </PCollapse>
    </PCollapseGroup>

    <PCollapseGroup size="lg">
      <PCollapse title="Question A">
        <div class="mb-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae
          alias debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non
          doloremque facere ea, hic incidunt necessitatibus.
        </div>
      </PCollapse>

      <PCollapse title="Question B">
        <div class="mb-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae
          alias debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non
          doloremque facere ea, hic incidunt necessitatibus.
        </div>
      </PCollapse>
    </PCollapseGroup>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` | - | Heading rendered in the trigger, overridable by the `title` slot |
| expand | `boolean` | - | Expand the panel; inside a group this is the initial state only |

## Events

| Name | Type | Description |
| --- | --- | --- |
| toggle | `(event: MouseEvent) => void` | Emitted when the trigger is clicked. |

## CollapseGroup Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| multiple | `boolean` | - | Allow several panels to stay expanded at the same time |
| size | `'sm' \| 'md' \| 'lg'` | - | Padding and font size of every panel; falls back to the config provider size |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |

## CollapseGroup Slots

| Name | Description |
| --- | --- |
| default | Default slot |
