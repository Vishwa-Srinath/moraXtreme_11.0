import { useFormContext, useWatch } from "react-hook-form"
import { JSONDebug } from "@/components/JSONDebug"

const FormDebug = () => {
  const form = useFormContext()
  const values = useWatch(form)

  return <JSONDebug value={values} />
}

export default FormDebug
