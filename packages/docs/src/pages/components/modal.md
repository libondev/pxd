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
    heading="Create Token"
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
    heading="Async Logic"
    :loading="isLoading"
    close-on-press-escape
    close-on-outside-click
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

  <PModal v-model="isVisible" default-header-style heading="Create Token" @outside-click="handleClose">
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
    heading="Create Token"
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


## Closeable

Set `closeable` to render a close button on the right of the header.

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)
</script>

<template>
  <PButton variant="primary" @click="isVisible = true">Open Modal</PButton>

  <PModal v-model="isVisible" heading="Closeable Modal" closeable>
    <PText>This modal shows a close button in the header.</PText>
  </PModal>
</template>
```

## Without Close on Click Overlay

Disable closing the modal when clicking on the overlay mask.

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

  <PModal v-model="isVisible" heading="Create Token" :close-on-outside-click="false">
    <PText> Some content contained within the modal. </PText>

    <template #footer>
      <PButton full-width @click="handleClose"> Cancel </PButton>
    </template>
  </PModal>
</template>
```

## Without Close on Press Escape

Disable closing the modal when the `Esc` key is pressed.

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

  <PModal v-model="isVisible" heading="Create Token" :close-on-press-escape="false">
    <PText> Some content contained within the modal. </PText>

    <template #footer>
      <PButton full-width @click="handleClose"> Cancel </PButton>
    </template>
  </PModal>
</template>
```

## Swipe to close

On screens narrower than `40rem` the modal is a bottom sheet, so `swipe-to-close` adds a drag handle and lets a downward drag dismiss it. Wider screens keep the centered panel and ignore the prop.

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)
</script>

<template>
  <PButton variant="primary" @click="isVisible = true">Open Modal</PButton>

  <PModal
    v-model="isVisible"
    heading="Swipe to close"
    subtitle="Resize below 40rem and drag the handle down"
    swipe-to-close
  >
    <PText>On a narrow screen, drag the handle at the top of the sheet down to close it.</PText>
  </PModal>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| heading | `string \| number \| null` | - | Header heading text, overridable by the `heading` slot |
| subtitle | `string \| number \| null` | - | Secondary text below the `heading`, overridable by the `subtitle` slot |
| width | `string \| number` | - | Panel width, numbers become `px`, defaulting to `33.75rem` from `sm` up |
| loading | `boolean` | - | Cover the modal with a loading mask and block closing |
| model-value | `boolean` | `false` | Whether the modal is open |
| loading-text | `string` | `'Loading...'` | Text shown inside the loading mask |
| wrapper-class | `string \| any[] \| object` | - | Class applied to the modal panel element |
| content-class | `string \| any[] \| object` | - | Class applied to the scrollable content element |
| initial-focus | `string \| boolean` | `false` | Focus the first tabbable element on open, or the one matching a selector |
| default-header-style | `boolean` | `false` | Apply the default header background and bottom border |
| default-footer-style | `boolean` | `true` | Apply the default footer background and top border |
| close-on-press-escape | `boolean` | `true` | Close the modal when `Esc` is pressed |
| close-on-outside-click | `boolean` | `true` | Close the modal when the overlay mask is clicked |
| closeable | `boolean` | `false` | Show a close button on the right of the header |
| swipe-to-close | `boolean` | `false` | Show a drag handle below `40rem` and let a downward drag dismiss the modal |

## Events

| Name | Type | Description |
| --- | --- | --- |
| show | `() => void` | Emitted right after the modal becomes visible. |
| hide | `() => void` | Emitted right after the modal becomes hidden. |
| close | `(reason: 'escape-key' \| 'outside-press' \| 'close-press' \| 'swipe') => void` | Emitted before the modal closes itself, saying which of the four ways it happened. |
| change | `(value: boolean, details: ChangeDetails<ModalChangeReason>) => void` | Emitted when the modal closes itself, with the same reason in `details.reason`. |
| outside-click | `(event: PointerEvent) => void` | Emitted when the overlay mask is clicked. |
| visible-change | `(visible: boolean) => void` | Emitted on every change of the visible state, whether it comes from the parent or from the modal itself. |
| update:model-value | `(visible: boolean) => void` | Emitted when the modal closes itself, so a `v-model` binding stays in sync. |

## Slots

| Name | Description |
| --- | --- |
| default | Modal body |
| header | Replaces the whole header content, including heading and subtitle |
| heading | Replaces the `heading` text inside the default header |
| subtitle | Replaces the `subtitle` text inside the default header |
| footer | Footer content, shown only when the slot is provided |
