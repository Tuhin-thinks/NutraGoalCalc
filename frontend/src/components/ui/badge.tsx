import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "outline" }>(
  ({ className, variant = "default", ...props }, ref) => {
    const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors"
    const variants = {
      default: "bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900",
      outline: "border border-neutral-200 text-neutral-900 dark:border-neutral-700 dark:text-neutral-100",
    }
    return <span ref={ref} className={cn(base, variants[variant], className)} {...props} />
  },
)
Badge.displayName = "Badge"

export { Badge }
