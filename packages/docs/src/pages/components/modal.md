# Modal

Display popup content that requires attention or provides additional information.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

function handleOpen() {
  isVisible.value = true
}

function handleClose() {
  isVisible.value = false
}
</script>

<template>
  <PButton variant="primary" @click="handleOpen">Open Modal</PButton>

  <PModal
    v-model="isVisible"
    title="Create Token"
    subtitle="Enter a unique name for your token to differentiate it from other tokens and then select the scope."
    @outside-click="handleClose"
  >
    <PText> Some content contained within the modal. </PText>

    <template #footer>
      <PButton @click="handleClose"> Cancel </PButton>

      <PButton variant="primary" @click="handleClose"> Submit </PButton>
    </template>
  </PModal>
</template>
```

## Loading

When `loading=true` is set, modal cannot be closed temporarily.

```vue demo
<script setup>
import { ref } from 'vue'

const isLoading = ref(false)
const isVisible = ref(false)

function handleOpen() {
  isVisible.value = true
}

function handleClose() {
  isLoading.value = true

  setTimeout(() => {
    isLoading.value = false
    isVisible.value = false
  }, 2000)
}
</script>

<template>
  <PButton variant="primary" @click="handleOpen">Open Modal</PButton>

  <PModal
    v-model="isVisible"
    title="Async Logic"
    :loading="isLoading"
    close-on-press-escape
    close-on-click-overlay
  >
    <PText>Content of the modal.</PText>

    <template #footer>
      <PButton full-width @click="handleClose"> Close (after two seconds) </PButton>
    </template>
  </PModal>
</template>
```

## Sticky

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

function handleOpen() {
  isVisible.value = true
}

function handleClose() {
  isVisible.value = false
}
</script>

<template>
  <PButton variant="primary" @click="handleOpen">Open Modal</PButton>

  <PModal v-model="isVisible" default-header-style title="Create Token" @outside-click="handleClose">
    <PText>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem
      quaerat exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus
      reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing
      elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero
      molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum
      dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat
      exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus
      reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing
      elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero
      molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum
      dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat
      exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus
      reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing
      elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero
      molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum
      dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat
      exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus
      reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing
      elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero
      molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?. Lorem ipsum
      dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat
      exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus
      reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing
      elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero
      molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum
      dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat
      exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus
      reiciendis amet soluta eaque dolores earum?Lorem ipsum dolor sit amet consectetur adipisicing
      elit. Repellat aut, blanditiis dolorem quaerat exercitationem quis tenetur vero fugit? Libero
      molestias cum, nemo repudiandae minus reiciendis amet soluta eaque dolores earum?Lorem ipsum
      dolor sit amet consectetur adipisicing elit. Repellat aut, blanditiis dolorem quaerat
      exercitationem quis tenetur vero fugit? Libero molestias cum, nemo repudiandae minus
      reiciendis amet soluta eaque dolores earum?
    </PText>

    <template #footer>
      <PButton @click="handleClose"> Cancel </PButton>

      <PButton variant="primary" @click="handleClose"> Submit </PButton>
    </template>
  </PModal>
</template>
```

## No default footer style

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

function handleOpen() {
  isVisible.value = true
}

function handleClose() {
  isVisible.value = false
}
</script>

<template>
  <PButton variant="primary" @click="handleOpen">Open Modal</PButton>

  <PModal
    v-model="isVisible"
    title="Create Token"
    :default-footer-style="false"
    subtitle="Enter a unique name for your token to differentiate it from other tokens and then select the scope."
    @outside-click="handleClose"
  >
    <PText> Some content contained within the modal. </PText>

    <template #footer>
      <PButton @click="handleClose"> Cancel </PButton>

      <PButton variant="primary" @click="handleClose"> Submit </PButton>
    </template>
  </PModal>
</template>
```


## Close on click overlay

After setting the `close-on-click-overlay` attribute, clicking on the mask will close modal.

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

function handleOpen() {
  isVisible.value = true
}

function handleClose() {
  isVisible.value = false
}
</script>

<template>
  <PButton variant="primary" @click="handleOpen">Open Modal</PButton>

  <PModal v-model="isVisible" title="Create Token" close-on-click-overlay>
    <PText> Some content contained within the modal. </PText>

    <template #footer>
      <PButton full-width @click="handleClose"> Cancel </PButton>
    </template>
  </PModal>
</template>
```

## Close on press escape

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

function handleOpen() {
  isVisible.value = true
}

function handleClose() {
  isVisible.value = false
}
</script>

<template>
  <PButton variant="primary" @click="handleOpen">Open Modal</PButton>

  <PModal v-model="isVisible" title="Create Token" close-on-press-escape>
    <PText> Some content contained within the modal. </PText>

    <template #footer>
      <PButton full-width @click="handleClose"> Cancel </PButton>
    </template>
  </PModal>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| z-index | `number` | - | Stacking order of the modal, applied through the `--modal-index` variable |
| title | `string \| number \| null` | - | Header title text, overridable by the `title` slot |
| subtitle | `string \| number \| null` | - | Secondary text below the title, overridable by the `subtitle` slot |
| width | `string \| number` | - | Panel width, numbers become `px`, defaulting to `33.75rem` from `sm` up |
| loading | `boolean` | - | Cover the modal with a loading mask and block closing |
| model-value | `boolean` | `false` | Whether the modal is open |
| loading-text | `string` | `'Loading...'` | Text shown inside the loading mask |
| append-to-body | `boolean` | `true` | Teleport the modal to `body` to escape overflow containers |
| wrapper-class | `string \| any[] \| object` | - | Class applied to the modal panel element |
| content-class | `string \| any[] \| object` | - | Class applied to the scrollable content element |
| auto-focus-element | `string \| boolean` | `false` | Focus the first tabbable element on open, or the one matching a selector |
| default-header-style | `boolean` | `false` | Apply the default header background and bottom border |
| default-footer-style | `boolean` | `true` | Apply the default footer background and top border |
| close-on-press-escape | `boolean` | `false` | Close the modal when `Esc` is pressed |
| close-on-click-overlay | `boolean` | `false` | Close the modal when the overlay mask is clicked |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
