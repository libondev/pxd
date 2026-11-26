# useForm

Headless form controller behind `PForm`. Use it when the component tree does not fit, or when the form owns no markup.

## Exports

```ts
import { useForm } from 'pxd'
```

## Types

```ts
import type {
  FormError,
  FormPath,
  FormValidateOn,
  FormValidatePayload,
  StandardSchema,
  UseFormOptions,
  UseFormReturn,
} from 'pxd'
```

## Params

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| model | `MaybeRefOrGetter<Record<string, any>>` | - | The caller's reactive object |
| schema | `MaybeRefOrGetter<StandardSchema>` | - | Any Standard Schema |
| validate | `(model) => FormError[] \| Promise<FormError[]>` | - | Custom validation, runs after the schema |
| initial-values | `MaybeRefOrGetter<Partial<M>>` | current model | Snapshot used by `reset()` |
| validate-on | `('blur' \| 'change')[]` | `['blur', 'change']` | Change validation trigger |
| debounce | `number` | `300` | Debounce for `change` validation in milliseconds |
| on-validate | `(payload: FormValidatePayload) => void` | - | Called after each validation run |

```ts
const model = reactive({ email: '' })

const form = useForm({
  model,
  validate: (values) =>
    values.email ? [] : [{ name: 'email', message: 'Email is required' }],
})

async function submit() {
  const result = await form.submit()

  if (result.valid) {
    console.log(result.data)
  }
}
```
