import React, { useState, KeyboardEvent, ChangeEvent, RefObject } from "react"
import { XIcon, PlusIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TagsInputProps {
  placeholder?: string
  value?: string[]
  onChange?: (tags: string[]) => void
  inputRef?: RefObject<HTMLInputElement>
  maxTags?: number
  className?: string
}

export default function TagsInput({
  placeholder = "Add a topic and press Enter",
  value = [],
  onChange,
  inputRef,
  maxTags,
  className = "",
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState<string>("")

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (
      trimmed &&
      !value.includes(trimmed) &&
      (!maxTags || value.length < maxTags)
    ) {
      onChange?.([...value, trimmed])
      setInputValue("")
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue)
    }
    if (e.key === "Backspace" && !inputValue && value.length) {
      onChange?.(value.slice(0, -1))
    }
  }

  const removeTag = (idx: number) => {
    const newTags = value.filter((_, i) => i !== idx)
    onChange?.(newTags)
  }

  const handleAddClick = () => {
    if (inputValue.trim()) addTag(inputValue)
  }

  return (
    <div className={`${className}`}>
      <div className="mb-3 flex flex-wrap gap-2">
        {value.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center rounded-lg bg-muted px-3 py-2 text-base font-medium text-muted-foreground"
            style={{ minHeight: 44 }}
          >
            {tag}

            <button
              type="button"
              className="ml-2 cursor-pointer rounded-full p-1 text-red-500 focus:ring-2 focus:ring-primary focus:outline-none"
              aria-label={`Remove ${tag}`}
              onClick={() => removeTag(idx)}
            >
              <XIcon size={16} />
            </button>
          </span>
        ))}
      </div>
      <div className="relative flex w-full items-center">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          type="text"
          inputMode="text"
          autoComplete="off"
          enterKeyHint="done"
          className="z-0"
          disabled={maxTags ? value.length >= maxTags : false}
        />
        <Button
          size={"icon"}
          type="button"
          variant={"default"}
          onClick={handleAddClick}
          disabled={
            !inputValue.trim() || (maxTags ? value.length >= maxTags : false)
          }
          className="absolute right-3 z-10"
          aria-label="Add tag"
        >
          <PlusIcon size={22} />
        </Button>
      </div>
    </div>
  )
}
