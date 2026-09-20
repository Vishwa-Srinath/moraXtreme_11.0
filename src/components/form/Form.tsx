"use client"

import type { ReactNode } from "react"

import type { FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form"
import { FormProvider } from "react-hook-form"

import FormItem from "./FormItem"
import FormCustomController from "./FormCustomController"

type FormProps<T extends FieldValues> = {
  children: ReactNode
  form: UseFormReturn<T, unknown, T>
  onFinish?: (data: unknown) => void
  id?: string
  className?: string
}

function Form<T extends FieldValues>({
  children,
  form,
  onFinish,
  id,
  className,
}: FormProps<T>) {
  const onSubmit: SubmitHandler<T> = (data) => {
    onFinish?.(data)
  }

  return (
    <FormProvider {...form}>
      <form
        className={className}
        id={id}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {children}
      </form>
    </FormProvider>
  )
}

Form.Item = FormItem
Form.CustomController = FormCustomController

export default Form
