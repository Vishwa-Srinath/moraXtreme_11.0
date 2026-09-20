import { type FC, type ReactNode } from "react"
import { type ControllerProps } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

type FormCustomControllerProps = Parameters<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ControllerProps<any, any, any>["render"]
>[0] & {
  className?: string
  hidden?: boolean
  children: ReactNode
  label?: string
  helperText?: string
}

const FormCustomController: FC<FormCustomControllerProps> = ({
  field,
  fieldState,
  className,
  hidden,
  label,
  children,
  helperText,
}) => {
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
      {label && (
        <Label
          className={cn("block text-base font-medium")}
          htmlFor={field.name}
        >
          {label}
        </Label>
      )}
      <div>{children}</div>
      <p
        className={cn(
          "text-xs text-muted-foreground",
          fieldState.invalid && "text-red-500"
        )}
      >
        {fieldState.invalid ? fieldState.error?.message : helperText}
      </p>
    </div>
  )
}

export default FormCustomController
