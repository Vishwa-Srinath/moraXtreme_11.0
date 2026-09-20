import type { FC, ReactElement } from "react"
import { Children, cloneElement, useId } from "react"

import type { ControllerRenderProps, FieldValues } from "react-hook-form"
import { Controller, useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

type FormItemProps = {
  children: ReactElement
  label: string
  name: string
  className?: string
  hidden?: boolean
  helperText?: string
  disabled?: boolean
}

export type FormItemChildrenProps = {
  id: string
  error: boolean
} & ControllerRenderProps<FieldValues, string>

const FormItem: FC<FormItemProps> = ({
  disabled,
  children,
  label,
  name,
  className,
  hidden,
  helperText,
}) => {
  const methods = useFormContext()

  const id = useId()

  if (Children.count(children) !== 1)
    throw new Error("Form item should have exactly one child")

  return (
    <Controller
      disabled={disabled}
      name={name}
      control={methods.control}
      render={({ field, fieldState }) => {
        const extraProps = {
          id,
          "aria-invalid": fieldState.invalid,
        }
        const child = Children.map(children, (child) =>
          cloneElement(child, { ...field, ...extraProps })
        )

        return (
          <div
            className={cn(
              "min-h-20 space-y-2",
              {
                "cursor-not-allowed opacity-50 select-none": field.disabled,
              },
              className
            )}
            hidden={hidden}
          >
            <Label className={cn("block text-base font-medium")} htmlFor={id}>
              {label}
            </Label>
            <div>{child}</div>
            <p
              className={cn(
                "text-xs whitespace-pre-wrap text-muted-foreground",
                fieldState.invalid && "text-red-500"
              )}
            >
              {fieldState.invalid ? fieldState.error?.message : helperText}
            </p>
          </div>
        )
      }}
    />
  )
}

export default FormItem
