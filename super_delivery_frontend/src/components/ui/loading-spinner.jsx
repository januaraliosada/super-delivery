import { cn } from "@/lib/utils"

const LoadingSpinner = ({ className, size = "default", ...props }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-6 w-6",
    large: "h-8 w-8",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-green-600",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

export { LoadingSpinner }

