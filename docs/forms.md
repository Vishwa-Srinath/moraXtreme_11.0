# Forms

The form system is a thin wrapper around [`react-hook-form`](https://react-hook-form.com/).
It provides a `<Form>` root, a field wrapper (`Form.Item`), an escape hatch for
custom components (`Form.CustomController`), and a repeatable-list helper
(`FormListInput`), plus a few ready-made inputs in `src/components/form-inputs`.

## Quick start

```tsx
"use client"

import { Controller, useForm } from "react-hook-form"

import Form from "@/components/form/Form"
import { Input } from "@/components/ui/input"
import { CheckboxInput } from "@/components/form-inputs/Checkbox"
import TagsInput from "@/components/form-inputs/TagsInput"

type FormValues = {
  name: string
  topics: string[]
  acceptTerms: boolean
}

export function ProfileForm() {
  const form = useForm<FormValues>({
    defaultValues: { name: "", topics: [], acceptTerms: false },
  })

  return (
    <Form form={form} onFinish={(data) => console.log(data)}>
      <Form.Item name="name" label="Name" helperText="Your full name">
        <Input placeholder="Jane Doe" />
      </Form.Item>

      <Controller
        control={form.control}
        name="topics"
        render={({ field, fieldState }) => (
          <Form.CustomController
            field={field}
            fieldState={fieldState}
            label="Topics"
          >
            <TagsInput value={field.value} onChange={field.onChange} />
          </Form.CustomController>
        )}
      />

      <Controller
        control={form.control}
        name="acceptTerms"
        render={({ field, fieldState }) => (
          <Form.CustomController field={field} fieldState={fieldState}>
            <CheckboxInput field={field} label="I accept the terms" />
          </Form.CustomController>
        )}
      />
    </Form>
  )
}
```

## `Form`

`src/components/form/Form.tsx`

| Prop        | Type                      | Description                                 |
| ----------- | ------------------------- | ------------------------------------------- |
| `form`      | `UseFormReturn<T>`        | The `useForm()` return value.               |
| `onFinish`  | `(data: unknown) => void` | Called with the validated values on submit. |
| `id`        | `string`                  | Passed to the underlying `<form>` element.  |
| `className` | `string`                  | Classes for the `<form>` element.           |
| `children`  | `ReactNode`               | Form fields.                                |

`Form` wraps its children in `FormProvider`, so nested components can call
`useFormContext()`. It must be rendered inside a client component.

## `Form.Item`

`src/components/form/FormItem.tsx`

`Form.Item` renders a `<Controller>` for `name`, then clones its **single**
child and injects the controller props (`value`, `onChange`, `onBlur`, `ref`,
`name`, `disabled`) plus `id` and `aria-invalid`. The child must be a component
that forwards those props to a real input (e.g. the shadcn `Input`).

| Prop         | Type           | Description                                              |
| ------------ | -------------- | -------------------------------------------------------- |
| `name`       | `string`       | Field path, supports dot notation and array indices.     |
| `label`      | `string`       | Rendered above the input.                                |
| `children`   | `ReactElement` | Exactly one element. Passing more than one throws.       |
| `helperText` | `string`       | Shown under the input when there is no validation error. |
| `disabled`   | `boolean`      | Disables the controller and dims the wrapper.            |
| `hidden`     | `boolean`      | Hides the whole field.                                   |
| `className`  | `string`       | Extra classes for the field wrapper.                     |

When the field is invalid, the error message replaces `helperText` and the text
turns red.

> The child must not be a plain function component that ignores props — the
> injected `ref` will warn. Use `Form.CustomController` for those.

## `Form.CustomController`

`src/components/form/FormCustomController.tsx`

Use this when the child cannot accept the spread controller props directly
(custom widgets, third-party components, or a component that needs its own
`value`/`onChange` mapping). It is designed to be used as the `render` prop of
your own `<Controller>`:

```tsx
import { Controller } from "react-hook-form"
import Form from "@/components/form/Form"

;<Controller
  control={form.control}
  name="birthday"
  render={({ field, fieldState }) => (
    <Form.CustomController
      field={field}
      fieldState={fieldState}
      label="Birthday"
    >
      <MyDateWidget value={field.value} onChange={field.onChange} />
    </Form.CustomController>
  )}
/>
```

It accepts all the `Controller` render props plus `label`, `helperText`,
`className`, and `hidden`.

## `FormListInput`

`src/components/form/FormListInput.tsx`

Renders a repeatable group of fields backed by `useFieldArray`. Its children is
a render function that receives `{ onRemove, getName }`:

```tsx
<FormListInput name="contacts" addButtonText="Add contact">
  {({ getName, onRemove }) => (
    <>
      <Form.Item name={getName("email")} label="Email">
        <Input type="email" />
      </Form.Item>
      <Button type="button" variant="destructive" onClick={onRemove}>
        Remove
      </Button>
    </>
  )}
</FormListInput>
```

| Prop            | Type                     | Description                           |
| --------------- | ------------------------ | ------------------------------------- |
| `name`          | `string`                 | Array field path (e.g. `"contacts"`). |
| `addButtonText` | `string`                 | Label of the append button.           |
| `children`      | `(helpers) => ReactNode` | Render function per row.              |
| `className`     | `string`                 | Classes for the wrapper.              |

`getName("email")` returns `contacts.0.email`, `contacts.1.email`, etc.

## Ready-made inputs

### `CheckboxInput`

`src/components/form-inputs/Checkbox.tsx`

Expects the `field` object from a controller render, so use it with
`Form.CustomController` or `Controller`.

```tsx
<Controller
  control={form.control}
  name="acceptTerms"
  render={({ field, fieldState }) => (
    <Form.CustomController field={field} fieldState={fieldState}>
      <CheckboxInput field={field} label="I accept the terms" />
    </Form.CustomController>
  )}
/>
```

### `TagsInput`

`src/components/form-inputs/TagsInput.tsx`

A standalone controlled input for `string[]`. It adds a tag on `Enter` or `,`,
removes the last tag on `Backspace`, and accepts a click on the plus button.

| Prop          | Type                          | Default                         |
| ------------- | ----------------------------- | ------------------------------- |
| `value`       | `string[]`                    | `[]`                            |
| `onChange`    | `(tags: string[]) => void`    | –                               |
| `placeholder` | `string`                      | `"Add a topic and press Enter"` |
| `maxTags`     | `number`                      | –                               |
| `inputRef`    | `RefObject<HTMLInputElement>` | –                               |
| `className`   | `string`                      | `""`                            |

Because it uses `inputRef` rather than a forwarded `ref`, prefer
`Form.CustomController` over `Form.Item`:

```tsx
<Controller
  control={form.control}
  name="topics"
  render={({ field, fieldState }) => (
    <Form.CustomController field={field} fieldState={fieldState} label="Topics">
      <TagsInput value={field.value} onChange={field.onChange} />
    </Form.CustomController>
  )}
/>
```
