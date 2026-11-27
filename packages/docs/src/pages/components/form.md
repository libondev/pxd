# Form

Groups fields with `PFormItem`, validates the model, and emits `submit` only when the form is valid.

## Default

```vue demo
<script setup>
import { reactive, ref } from 'vue'

const model = reactive({ name: '', email: '' })
const submitted = ref('')

function validate(values) {
  const errors = []

  if (!values.name) {
    errors.push({ name: 'name', message: 'Name is required' })
  }

  if (!values.email.includes('@')) {
    errors.push({ name: 'email', message: 'Enter a valid email' })
  }

  return errors
}

function onSubmit({ data }) {
  submitted.value = JSON.stringify(data)
}
</script>

<template>
  <PForm :model="model" :validate="validate" class="gap-3 flex flex-col" @submit="onSubmit">
    <PFormItem name="name" label="Name" required>
      <PInput v-model="model.name" />
    </PFormItem>

    <PFormItem name="email" label="Email" description="We never share it.">
      <PInput v-model="model.email" />
    </PFormItem>

    <PStack>
      <PButton type="submit">Submit</PButton>
    </PStack>

    <p v-if="submitted" class="text-xs text-foreground-secondary">{{ submitted }}</p>
  </PForm>
</template>
```

## Server errors

```vue demo
<script setup>
import { reactive, ref } from 'vue'

const form = ref()
const model = reactive({ email: '' })

function save() {
  form.value.setErrors([{ name: 'email', message: 'This email is already taken' }])
}
</script>

<template>
  <PForm ref="form" :model="model" class="gap-3 flex flex-col">
    <PFormItem name="email" label="Email">
      <PInput v-model="model.email" />
    </PFormItem>

    <PStack>
      <PButton @click="save">Save</PButton>
    </PStack>
  </PForm>
</template>
```

## Label position

```vue demo
<script setup>
import { reactive } from 'vue'

const model = reactive({ name: '', email: '' })
</script>

<template>
  <PForm :model="model" label-position="left" label-width="6rem" class="gap-3 flex flex-col">
    <PFormItem name="name" label="Name" required>
      <PInput v-model="model.name" />
    </PFormItem>

    <PFormItem name="email" label="Email">
      <PInput v-model="model.email" />
    </PFormItem>
  </PForm>
</template>
```

## Optional fields

Set `required-mark="optional"` when most fields are required: the item hint then marks the optional
ones instead.

```vue demo
<script setup>
import { reactive } from 'vue'

const model = reactive({ name: '', email: '' })
</script>

<template>
  <PForm :model="model" required-mark="optional" class="gap-3 flex flex-col">
    <PFormItem name="name" label="Name" required>
      <PInput v-model="model.name" />
    </PFormItem>

    <PFormItem name="email" label="Email">
      <PInput v-model="model.email" />
    </PFormItem>
  </PForm>
</template>
```

## Manual field

```vue demo
<script setup>
import { reactive } from 'vue'

const model = reactive({ email: '' })
</script>

<template>
  <PForm :model="model" class="gap-3 flex flex-col">
    <PFormItem name="email" label="Email" description="We never share it.">
      <PInput v-model="model.email" />
    </PFormItem>
  </PForm>
</template>
```

## Auto-rendered field

Pass a component (or a native tag name) to render the control from data. Native tags cover text
inputs and checkbox/radio; use a component for select, date pickers or anything that needs options
or slots.

```vue demo
<script setup>
import { reactive } from 'vue'
import { Input } from 'pxd'

const model = reactive({ email: '' })
</script>

<template>
  <PForm :model="model" class="gap-3 flex flex-col">
    <PFormItem
      name="email"
      label="Email"
      :component="Input"
      :component-props="{ type: 'email', placeholder: 'you@example.com' }"
    />
  </PForm>
</template>
```

## Descriptor list

A list of `PFormItem` props is enough to render a whole form.

```vue demo
<script setup>
import { reactive } from 'vue'
import { Input, Select } from 'pxd'

const model = reactive({ name: '', role: 'user' })
const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
]

const fields = [
  { name: 'name', label: 'Name', component: Input, componentProps: { placeholder: 'Jane' } },
  { name: 'role', label: 'Role', component: Select, componentProps: { options: roles } },
]
</script>

<template>
  <PForm :model="model" class="gap-3 flex flex-col">
    <PFormItem v-for="field in fields" :key="String(field.name)" v-bind="field" />
  </PForm>
</template>
```

## Slots on an auto-rendered control

`component-slots` forwards named slots to the inner control; `PFormItem`'s own `label`,
`description` and `error-message` slots still belong to the field chrome.

```vue demo
<script setup>
import { h, reactive } from 'vue'
import { Input } from 'pxd'

const model = reactive({ amount: '' })
</script>

<template>
  <PForm :model="model" class="gap-3 flex flex-col">
    <PFormItem
      name="amount"
      label="Amount"
      :component="Input"
      :component-props="{ placeholder: '0.00' }"
      :component-slots="{
        prefix: () => h('span', { class: 'text-foreground-secondary' }, '¥'),
      }"
    />
  </PForm>
</template>
```

## Custom control

The default slot exposes the same binding `component` uses.

```vue demo
<script setup>
import { reactive } from 'vue'

const model = reactive({ email: '' })
</script>

<template>
  <PForm :model="model" class="gap-3 flex flex-col">
    <PFormItem name="email" label="Email" v-slot="{ attrs, value, setValue }">
      <input
        v-bind="attrs"
        :value="value"
        class="px-3 h-9 w-full border rounded-md bg-background-100"
        @input="setValue($event.target.value)"
      />
    </PFormItem>
  </PForm>
</template>
```

## Arrays

Array paths (`contacts.0.email`) work directly; `error-pattern` lets one item show errors for a
whole list.

```vue demo
<script setup>
import { reactive } from 'vue'

const model = reactive({ contacts: [{ email: '' }] })

function add() {
  model.contacts.push({ email: '' })
}

function remove(index) {
  model.contacts.splice(index, 1)
}

function validate(values) {
  return values.contacts.flatMap((contact, index) =>
    contact.email ? [] : [{ name: `contacts.${index}.email`, message: 'Email is required' }],
  )
}
</script>

<template>
  <PForm :model="model" :validate="validate" class="gap-3 flex flex-col">
    <PFormItem
      v-for="(contact, index) in model.contacts"
      :key="index"
      :name="`contacts.${index}.email`"
      :label="`Contact ${index + 1}`"
    >
      <PStack>
        <PInput v-model="contact.email" />
        <PButton type="button" @click="remove(index)">Remove</PButton>
      </PStack>
    </PFormItem>

    <PStack>
      <PButton type="button" @click="add">Add contact</PButton>
      <PButton type="submit">Submit</PButton>
    </PStack>
  </PForm>
</template>
```

## Login form

An async submit with an app-owned pending state and a server error.

```vue demo
<script setup>
import { reactive, ref } from 'vue'

const form = ref()
const model = reactive({ email: '', password: '' })
const submitting = ref(false)
const signedIn = ref(false)

async function signIn({ data }) {
  submitting.value = true
  signedIn.value = false
  form.value.clearErrors()

  await new Promise((resolve) => setTimeout(resolve, 600))

  if (data.password !== 'secret') {
    form.value.setErrors([{ name: 'password', message: 'Password is incorrect' }])
  } else {
    signedIn.value = true
  }

  submitting.value = false
}
</script>

<template>
  <PForm
    ref="form"
    :model="model"
    :pending="submitting"
    class="max-w-sm gap-3 flex flex-col"
    @submit="signIn"
  >
    <PFormItem name="email" label="Email" required>
      <PInput v-model="model.email" type="email" :input-attrs="{ autocomplete: 'email' }" />
    </PFormItem>

    <PFormItem name="password" label="Password" required>
      <PInput
        v-model="model.password"
        password
        :input-attrs="{ autocomplete: 'current-password' }"
      />
    </PFormItem>

    <PButton type="submit" :loading="submitting">Sign in</PButton>

    <p v-if="signedIn" class="text-xs text-green-900">Signed in</p>
  </PForm>
</template>
```

## Settings form

A settings layout with a select, a segmented switch and a checkbox group.

```vue demo
<script setup>
import { reactive, ref } from 'vue'

const form = ref()
const model = reactive({
  name: '',
  role: 'user',
  notifications: 'on',
  channels: ['email'],
})
const saved = ref(false)
const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
]
const notifications = [
  { label: 'Off', value: 'off' },
  { label: 'On', value: 'on' },
]
const channels = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
]

function save() {
  saved.value = true
}

function reset() {
  form.value.reset()
  saved.value = false
}
</script>

<template>
  <PForm
    ref="form"
    :model="model"
    label-position="left"
    label-width="9rem"
    class="max-w-xl gap-3 flex flex-col"
    @submit="save"
  >
    <PFormItem name="name" label="Name" required>
      <PInput v-model="model.name" />
    </PFormItem>

    <PFormItem name="role" label="Role">
      <PSelect v-model="model.role" :options="roles" />
    </PFormItem>

    <PFormItem name="notifications" label="Notifications" hint="Email only">
      <PSwitch v-model="model.notifications" :options="notifications" />
    </PFormItem>

    <PFormItem name="channels" label="Channels" description="Where we send updates">
      <PCheckboxGroup v-model="model.channels" :options="channels" />
    </PFormItem>

    <PStack>
      <PButton type="submit">Save</PButton>
      <PButton @click="reset">Reset</PButton>
    </PStack>

    <p v-if="saved" class="text-xs text-green-900">Saved</p>
  </PForm>
</template>
```

## Standalone

Without a `PForm`, `error-message` supplies the message and still marks the control invalid.

```vue demo
<script setup>
import { ref } from 'vue'

const email = ref('')
</script>

<template>
  <PFormItem label="Email" error-message="Enter a valid email" class="max-w-sm">
    <PInput v-model="email" />
  </PFormItem>
</template>
```

## Nested forms

Native `<form>` elements cannot nest, and `PForm` renders a real `<form>`. Do not mount a `PForm`
inside another `PForm`'s DOM subtree. A teleported `PModal` / `PDrawer` puts its content outside
the outer form, which is the supported way to show a second form. A dedicated `nested` mode is not
implemented yet.

## Agent

`PForm` registers a `form` node with `validate` and `submit` actions. Its state is `valid`, `dirty`,
`submitted`, `errorCount` and `invalidFields`; values stay on each control's own node, and error
messages are not exposed. A failed validation is reported as state (`valid: false`), not as an
action failure. The `submit` action returns only `{ valid, errorCount, invalidFields }`, never the
model or messages.

The form's own state stays visible even when its first field is a password; each password field's
value is still `[redacted]` on that field's node.

Put `data-agent-confirm` on the form to make an agent ask a person before submitting:

```vue
<PForm :model="model" data-agent-confirm="Submit this form" @submit="onSubmit">
  ...
</PForm>
```

Set `pending` while the app-owned save is running so an agent waits for it.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| id | `string` | - | Prefix for the form and its item ids; pass one for stable SSR ids |
| model | `Record<string, any>` | - | The caller's reactive object; `PForm` never replaces it. Keep it plain data: without a schema, submit clones it with `structuredClone` |
| schema | `StandardSchema` | - | Any Standard Schema, e.g. Zod, Valibot or ArkType |
| validate | `(model) => FormError[] \| Promise<FormError[]>` | - | Custom validation, runs after the schema |
| validate-on | `('blur' \| 'change')[]` | `['blur', 'change']` | When a change validates |
| debounce | `number` | `300` | Debounce for `change` validation in milliseconds |
| label-position | `'top' \| 'left' \| 'right' \| 'inline'` | `top` | Label placement inherited by items |
| label-width | `string` | - | Label column width for `left` and `right` |
| required-mark | `boolean \| 'optional'` | `true` | Show a required asterisk, or mark optional fields instead |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | - | Size inherited by controls through the item context |
| disabled | `boolean` | - | Disable controls that read the item context |
| readonly | `boolean` | - | Make controls read-only where supported |
| scroll-to-error | `boolean` | `true` | Focus and scroll to the first invalid item on submit |
| pending | `boolean` | `false` | Reports an app-owned save in flight; feeds `aria-busy` |

## Events

| Name | Type | Description |
| --- | --- | --- |
| submit | `(payload: { data: Output, originalEvent?: Event }) => void` | Emitted only after validation passes; `data` is the schema output, or a clone of the model when there is no schema. |
| invalid | `(payload: { errors: FormError[], first?: FormError }) => void` | Emitted when submit fails; focus moves to the first invalid item. |
| validate | `(payload: { name?: FormPath, valid: boolean, errors: FormError[] }) => void` | Emitted after a validation run. |
| reset | `() => void` | Emitted when `reset()` runs. |

## FormItem Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| name | `string \| (string \| number)[]` | - | Path in the form model, e.g. `email` or `address.city`; paths must be unique within a form |
| label | `string` | - | Visible label; the slot `label` overrides it |
| description | `string` | - | Helper text below the control |
| hint | `string` | - | Right-aligned text beside the label; defaults to the optional marker |
| required | `boolean` | `false` | Shows the asterisk and sets `required` / `aria-required` |
| error-message | `string \| null` | - | Message override; also marks the control invalid without a form |
| error-pattern | `RegExp` | - | Show errors whose path matches this pattern, e.g. `/^tags\./` for array items; works without `name` |
| rules | `StandardSchema` | - | Field-level schema; runs together with the form schema and custom `validate` |
| for | `string` | - | Explicit `for` target; defaults to the generated control id |
| label-width | `string` | - | Label column width for `left` and `right` |
| label-position | `'top' \| 'left' \| 'right' \| 'inline'` | - | Overrides the form's label position |
| show-message | `boolean` | `true` | Render the message container |
| component | `Component \| string` | - | Auto-rendered control, or a native tag name |
| component-props | `Record<string, unknown>` | - | Props passed to the auto-rendered control |
| component-slots | `Record<string, (props?) => VNodeChild>` | - | Named slots forwarded to the auto-rendered control |

## FormItem Slots

| Name | Description |
| --- | --- |
| default | The control; scoped with `control`, `attrs`, `value`, `setValue`, `error`, `errors`, `invalid`, `validate` and `reset`. |
| label | Replaces the label text. |
| description | Replaces the description text. |
| error-message | Replaces the message; scoped with `error` and `errors`. |

## FormItem Methods

| Name | Type | Description |
| --- | --- | --- |
| validate | `(trigger?: 'blur' \| 'change') => Promise<boolean>` | Validate this field. |
| reset | `() => void` | Restore this field from the form snapshot. |
| clearErrors | `() => void` | Clear this field's errors. |
| error | `string \| undefined` | The currently visible message. |
| invalid | `boolean` | Whether the control should render as invalid. |

## Slots

| Name | Description |
| --- | --- |
| default | The form items. |
| error-message | Root and unmatched errors, scoped with `errors` and `first`. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| validate | `(...names: FormPath[]) => Promise<boolean>` | Validate everything, or the named paths. |
| validateField | `(name: FormPath) => Promise<boolean>` | Validate one path. |
| reset | `(name?: FormPath) => void` | Restore the snapshot, or one path, and clear its errors. |
| setInitialValues | `(values?: Partial<M>) => void` | Re-snapshot the model for later resets without writing it. |
| clearErrors | `(name?: FormPath) => void` | Clear all errors, or one path and its children. |
| setErrors | `(errors: FormError[]) => void` | Replace errors, e.g. with a server response. |
| errors | `FormError[]` | Current errors. |
| isValidating | `boolean` | Whether a validation run is pending. |
| isValid | `boolean` | Whether the current error list is empty. |
| isDirty | `boolean` | Whether the model was written since setup or the last reset. |
| isSubmitted | `boolean` | Whether submit has run. |
