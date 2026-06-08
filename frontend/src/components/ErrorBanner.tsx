import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorBannerProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorBanner({ message, onRetry, className }: ErrorBannerProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700", className)}>
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="h-7 shrink-0 gap-1 text-red-600 hover:text-red-700">
          <RefreshCw className="h-3 w-3" /> Retry
        </Button>
      )}
    </div>
  )
}
