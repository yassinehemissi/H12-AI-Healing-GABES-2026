import { toast as sonnerToast } from "sonner"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export const toast = ({ title, description, variant = "default" }: ToastProps) => {
  const message = title || description || ""
  const descriptionText = title && description ? description : ""

  if (variant === "destructive") {
    sonnerToast.error(message, {
      description: descriptionText,
    })
  } else {
    sonnerToast.success(message, {
      description: descriptionText,
    })
  }
}