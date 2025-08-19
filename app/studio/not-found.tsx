import { FileQuestion } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import italianContent from '@/lib/constants/italian-content'

export default function StudioNotFound() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileQuestion className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{italianContent.errors.notFound}</CardTitle>
          </div>
          <CardDescription>
            La pagina che stai cercando non esiste o è stata spostata.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/studio">
                {italianContent.app.back} {italianContent.navigation.dashboard}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
