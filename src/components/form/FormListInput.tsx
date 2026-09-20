import type { FC, ReactNode } from "react"

import { useFieldArray, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"

type FormListChildrenData = {
  onRemove: () => void
  getName: (name: string) => string
}

type FormListInputProps = {
  name: string
  addButtonText: string
  children: (props: FormListChildrenData) => ReactNode
  label?: string
  className?: string
}

const FormListInput: FC<FormListInputProps> = ({
  name: listName,
  className,
  addButtonText,
  children,
}) => {
  const methods = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: listName,
  })

  const onAdd = () => append({})

  return (
    <div className={className}>
      {fields.map((item, index) => {
        const getName = (inputName: string) =>
          `${listName}.${index}.${inputName}`

        const onRemove = () => remove(index)

        return (
          <div className="relative" key={item.id}>
            {children({ onRemove, getName })}
          </div>
        )
      })}

      <Button className="mt-2" onClick={onAdd}>
        {addButtonText}
      </Button>
    </div>
  )
}

export default FormListInput
