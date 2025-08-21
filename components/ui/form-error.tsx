import { AlertCircle } from "lucide-react"

interface FormErrorProps {
  errors: string[]
}

export function FormError({ errors }: FormErrorProps) {
  if (errors.length === 0) return null

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-2">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-destructive">
              {error}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
