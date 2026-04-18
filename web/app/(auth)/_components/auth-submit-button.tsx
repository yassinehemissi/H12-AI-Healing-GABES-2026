"use client"

import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"

type AuthSubmitButtonProps = {
  text: string
  pendingText: string
}

export function AuthSubmitButton({ text, pendingText }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? pendingText : text}
    </Button>
  )
}
