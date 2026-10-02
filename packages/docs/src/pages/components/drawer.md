# Drawer

A sliding panel that appears from the edge of the screen, typically used for navigation, forms, or additional content.

## Default

Basic drawer that slides in from the right side.

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
  <PButton variant="primary" @click="handleOpen">Open Drawer</PButton>

  <PDrawer
    v-model="isVisible"
    title="Settings"
    subtitle="Configure your application settings"
    @outside-click="handleClose"
  >
    <PText>This is the drawer content. You can put any content here.</PText>
    <PText class="mt-4"
      >The drawer will close when you click outside or press the close button.</PText
    >

    <template #footer>
      <PButton @click="handleClose"> Cancel </PButton>
      <PButton variant="primary" @click="handleClose"> Save Changes </PButton>
    </template>
  </PDrawer>
</template>
```

## Loading

When `loading=true` is set, drawer cannot be closed temporarily.

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
  <PButton variant="primary" @click="handleOpen">Open Drawer</PButton>

  <PDrawer
    v-model="isVisible"
    :loading="isLoading"
    title="Settings"
    subtitle="Configure your application settings"
    close-on-press-escape
    close-on-click-overlay
    @outside-click="handleClose"
  >
    <template #footer>
      <PButton full-width @click="handleClose"> Cancel </PButton>
    </template>
  </PDrawer>
</template>
```

## Position

Drawer can slide in from different directions: top, right, bottom, or left.

```vue demo
<script setup>
import { ref } from 'vue'

const topVisible = ref(false)
const rightVisible = ref(false)
const bottomVisible = ref(false)
const leftVisible = ref(false)
</script>

<template>
  <PStack>
    <PButton @click="topVisible = true">Top</PButton>
    <PButton @click="rightVisible = true">Right</PButton>
    <PButton @click="bottomVisible = true">Bottom</PButton>
    <PButton @click="leftVisible = true">Left</PButton>
  </PStack>

  <PDrawer v-model="topVisible" position="top" title="Top Drawer" size="350px">
    <PText>This drawer slides in from the top.</PText>
  </PDrawer>

  <PDrawer v-model="rightVisible" position="right" title="Right Drawer" size="350px">
    <PText>This drawer slides in from the right.</PText>
  </PDrawer>

  <PDrawer v-model="bottomVisible" position="bottom" title="Bottom Drawer" size="350px">
    <PText>This drawer slides in from the bottom.</PText>
  </PDrawer>

  <PDrawer v-model="leftVisible" position="left" title="Left Drawer" size="350px">
    <PText>This drawer slides in from the left.</PText>
  </PDrawer>
</template>
```


## No default footer style

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)
</script>

<template>
  <PStack>
    <PButton @click="isVisible = true">Show</PButton>
  </PStack>

  <PDrawer v-model="isVisible" title="Drawer" :default-footer-style="false">
    <PText>This drawer slides in from the top.</PText>

    <template #footer>
      <PButton full-width @click="isVisible = false"> Close Drawer </PButton>
    </template>
  </PDrawer>
</template>
```

## Custom Size

You can customize the drawer size using `size` prop.

```vue demo
<script setup>
import { ref } from 'vue'

const smallVisible = ref(false)
const largeVisible = ref(false)
const fullVisible = ref(false)
</script>

<template>
  <PStack>
    <PButton @click="smallVisible = true">Small (240px)</PButton>
    <PButton @click="largeVisible = true">Large (600px)</PButton>
    <PButton @click="fullVisible = true">Full Width</PButton>
  </PStack>

  <PDrawer v-model="smallVisible" title="Small Drawer" size="240px">
    <PText>This is a small drawer with 240px width.</PText>

    <template #footer>
      <PButton full-width @click="smallVisible = false">Close</PButton>
    </template>
  </PDrawer>

  <PDrawer v-model="largeVisible" title="Large Drawer" size="600px">
    <PText>This is a large drawer with 600px width.</PText>
    <PText class="mt-4">More content can fit in this larger drawer.</PText>

    <template #footer>
      <PButton full-width @click="largeVisible = false">Close</PButton>
    </template>
  </PDrawer>

  <PDrawer v-model="fullVisible" title="Full Width Drawer" size="100%">
    <PText>This drawer takes the full width of the viewport.</PText>

    <template #footer>
      <PButton full-width @click="fullVisible = false">Close</PButton>
    </template>
  </PDrawer>
</template>
```

## Without Close on Click Overlay

Disable closing the drawer when clicking on the overlay.

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)
</script>

<template>
  <PButton variant="primary" @click="isVisible = true">Open Drawer</PButton>

  <PDrawer
    v-model="isVisible"
    title="Persistent Drawer"
    subtitle="This drawer won't close when clicking outside"
    :close-on-click-overlay="false"
  >
    <PText>This drawer will only close when you use the footer buttons.</PText>

    <template #footer>
      <PButton full-width @click="isVisible = false"> Close Drawer </PButton>
    </template>
  </PDrawer>
</template>
```

## Form Example

A practical example using drawer for a form.

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)
const formData = ref({
  name: '',
  email: '',
  message: '',
})

function openForm() {
  isVisible.value = true
}

function closeForm() {
  isVisible.value = false
}

function submitForm() {
  // Handle form submission
  console.log('Form submitted:', formData.value)
  closeForm()
}

function resetForm() {
  formData.value = {
    name: '',
    email: '',
    message: '',
  }
}
</script>

<template>
  <PButton variant="primary" @click="openForm">Contact Us</PButton>

  <PDrawer
    v-model="isVisible"
    title="Contact Form"
    subtitle="Send us a message and we'll get back to you"
    size="500px"
  >
    <div class="space-y-4">
      <PInput v-model="formData.name" label="Name" placeholder="Your name" />

      <PInput v-model="formData.email" label="Email" type="email" placeholder="your@email.com" />

      <PTextarea
        v-model="formData.message"
        label="Message"
        placeholder="Your message..."
        rows="4"
      />
    </div>

    <template #footer>
      <PButton @click="resetForm"> Reset </PButton>
      <PButton class="mr-auto" @click="closeForm"> Cancel </PButton>

      <PButton variant="primary" @click="submitForm"> Send Message </PButton>
    </template>
  </PDrawer>
</template>
```

## Navigation Example

Using drawer for navigation menu.

```vue demo
<script setup>
import { ref } from 'vue'
import EdgeIcon from '@gdsicon/vue/edge'
import FileIcon from '@gdsicon/vue/file'
import SettingsGearIcon from '@gdsicon/vue/settings-gear'
import QuestionIcon from '@gdsicon/vue/question'
import BookmarkIcon from '@gdsicon/vue/bookmark'

const isVisible = ref(false)

const menuItems = [
  { label: 'Dashboard', icon: EdgeIcon, href: '#' },
  { label: 'Projects', icon: FileIcon, href: '#' },
  { label: 'Bookmarks', icon: BookmarkIcon, href: '#' },
  { label: 'Settings', icon: SettingsGearIcon, href: '#' },
  { label: 'Help', icon: QuestionIcon, href: '#' },
]

function openMenu() {
  isVisible.value = true
}
</script>

<template>
  <PButton variant="ghost" @click="openMenu">☰ Menu</PButton>

  <PDrawer v-model="isVisible" title="Navigation" position="left" size="280px">
    <nav class="space-y-2 -mx-2">
      <a
        v-for="item in menuItems"
        :key="item.label"
        href="javascript:void(0)"
        class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-background-hover transition-colors"
        @click="isVisible = false"
      >
        <Component :is="item.icon" />
        <span>{{ item.label }}</span>
      </a>
    </nav>

    <template #footer>
      <PButton full-width @click="isVisible = false"> Close Menu </PButton>
    </template>
  </PDrawer>
</template>
```

## Without Header

Drawer without title and subtitle.

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)
</script>

<template>
  <PButton variant="primary" @click="isVisible = true">Open Simple Drawer</PButton>

  <PDrawer v-model="isVisible" size="350px">
    <h3 class="text-lg font-semibold mb-4">Custom Header</h3>
    <PText
      >This drawer doesn't use the built-in header. You can create your own custom header and
      content layout.</PText
    >
    <PText class="mt-4">This gives you complete control over the drawer's appearance.</PText>

    <template #footer>
      <PButton full-width @click="isVisible = false"> Close </PButton>
    </template>
  </PDrawer>
</template>
```

## Scrollable Content

Drawer with long scrollable content.

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

const longContent = Array.from(
  { length: 50 },
  (_, i) => `Item ${i + 1}: This is a long list item with some content.`,
)
</script>

<template>
  <PButton variant="primary" @click="isVisible = true">Open Scrollable Drawer</PButton>

  <PDrawer
    v-model="isVisible"
    title="Long Content"
    subtitle="This drawer contains scrollable content"
    size="350px"
  >
    <div class="space-y-3">
      <div v-for="item in longContent" :key="item" class="p-3 bg-background-200 rounded-md">
        {{ item }}
      </div>
    </div>

    <template #footer>
      <PButton full-width @click="isVisible = false"> Close </PButton>
    </template>
  </PDrawer>
</template>
```

## Nested Drawers

Example showing how drawers can be nested.

```vue demo
<script setup>
import { ref } from 'vue'

const firstDrawer = ref(false)
const secondDrawer = ref(false)
</script>

<template>
  <PButton variant="primary" @click="firstDrawer = true">Open First Drawer</PButton>

  <PDrawer
    v-model="firstDrawer"
    title="First Drawer"
    subtitle="This is the first drawer"
    size="350px"
  >
    <PText>This is the first drawer. You can open another drawer from here.</PText>

    <PButton class="mt-4" variant="primary" @click="secondDrawer = true">
      Open Second Drawer
    </PButton>

    <template #footer>
      <PButton full-width @click="firstDrawer = false"> Close First </PButton>
    </template>
  </PDrawer>

  <PDrawer
    v-model="secondDrawer"
    title="Second Drawer"
    subtitle="This is nested inside the first drawer"
    size="350px"
    position="left"
  >
    <PText>This is the second drawer, opened from within the first drawer.</PText>
    <PText class="mt-4"
      >Notice how it slides in from the left to differentiate from the first drawer.</PText
    >

    <template #footer>
      <PButton full-width @click="secondDrawer = false"> Close Second </PButton>
    </template>
  </PDrawer>
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
  <PButton variant="primary" @click="handleOpen">Open Drawer</PButton>

  <PDrawer v-model="isVisible" title="Close on Press Escape" close-on-press-escape>
    <PText>Press the escape key to close this drawer.</PText>

    <template #footer>
      <PButton full-width @click="handleClose"> Close </PButton>
    </template>
  </PDrawer>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| z-index | `number` | - | Sets the `z-index` of the drawer panel |
| title | `string \| number \| null` | - | Heading text rendered in the built-in header |
| subtitle | `string \| number \| null` | - | Secondary text rendered under the `title` |
| size | `number \| string` | - | Width for `left`/`right` and height for `top`/`bottom`, any CSS length, defaults to `30vw`/`30vh` |
| loading | `boolean` | - | Show a loading mask and block closing the drawer |
| position | `BasePosition` | `right` | Edge the drawer slides in from: `top`, `right`, `bottom` or `left` |
| model-value | `boolean` | `false` | Whether the drawer is open, use with `v-model` |
| loading-text | `string` | `'Loading...'` | Text shown by the loading mask while `loading` |
| append-to-body | `boolean` | `true` | Teleport the drawer overlay into `document.body` |
| wrapper-class | `string \| any[] \| object` | - | Class applied to the drawer panel |
| content-class | `string \| any[] \| object` | - | Class applied to the scrollable content area |
| auto-focus-element | `string \| boolean` | `false` | Focus the first tabbable element on open, or the element matching a CSS selector |
| default-header-style | `boolean` | `false` | Apply the default header padding, border and background |
| default-footer-style | `boolean` | `true` | Apply the default footer padding, border and background |
| close-on-press-escape | `boolean` | `true` | Close the drawer when the `Esc` key is pressed |
| close-on-click-overlay | `boolean` | `true` | Close the drawer when the overlay is clicked |

## Events

| Name | Type | Description |
| --- | --- | --- |
| show | `() => void` | Emitted when the drawer becomes visible. |
| hide | `() => void` | Emitted when the drawer stops being visible. |
| change | `(visible: boolean) => void` | Emitted together with `update:modelValue` when the open state of the drawer changes. |
| outside-click | `(ev: PointerEvent) => void` | Emitted when the overlay behind the drawer is clicked. |
| visible-change | `(visible: boolean) => void` | Emitted after every change of the drawer's open state. |
| update:modelValue | `(visible: boolean) => void` | Emitted when the open state of the drawer changes. |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
