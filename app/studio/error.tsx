'use client'

import { AlertCircle } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import italianContent from '@/lib/constants/italian-content'

export default function StudioError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      // biome-ignore lint/suspicious/noConsole: Error logging is needed in development
      console.error('Studio error:', error)
    }
  }, [error])

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>{italianContent.app.error}</CardTitle>
          </div>
          <CardDescription>{italianContent.errors.generic}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button onClick={reset}>{italianContent.app.retry}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
