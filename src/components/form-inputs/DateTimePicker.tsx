"use client"

import { format } from "date-fns"
import { CalendarIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DateTimePickerProps = {
  id?: string
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  invalid?: boolean
  placeholder?: string
}

function parseDate(value?: string) {
  if (!value) return undefined

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function toLocalDateTime(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function DateTimePicker({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
  placeholder = "Pick a date and time",
}: DateTimePickerProps) {
  const date = parseDate(value)

  function selectDate(selectedDate: Date | undefined) {
    if (!selectedDate) return

    const nextDate = new Date(selectedDate)
    nextDate.setHours(date?.getHours() ?? 0, date?.getMinutes() ?? 0, 0, 0)
    onChange(toLocalDateTime(nextDate))
  }

  function selectTime(time: string) {
    if (!date || !time) return

    const [hours, minutes] = time.split(":").map(Number)
    const nextDate = new Date(date)
    nextDate.setHours(hours, minutes, 0, 0)
    onChange(toLocalDateTime(nextDate))
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
            aria-invalid={invalid}
            onBlur={onBlur}
          />
        }
      >
        <CalendarIcon />
        {date ? format(date, "PPP 'at' HH:mm") : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto gap-0 p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={selectDate}
          autoFocus
        />
        <div className="flex items-center gap-2 border-t p-3">
          <Input
            type="time"
            value={date ? format(date, "HH:mm") : ""}
            onChange={(event) => selectTime(event.target.value)}
            disabled={!date}
            aria-label="Time"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange("")}
            disabled={!date}
            aria-label="Clear date and time"
          >
            <XIcon />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
