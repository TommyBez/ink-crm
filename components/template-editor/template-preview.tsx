'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PreviewField } from './preview-field'
import italianContent from '@/lib/constants/italian-content'
import type { TemplateSchema } from '@/types/template'

interface TemplatePreviewProps {
  name: string
  description?: string
  schema: TemplateSchema
}

export function TemplatePreview({ name, description, schema }: TemplatePreviewProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{name}</CardTitle>
            <Badge variant="secondary">
              {italianContent.templates.preview}
            </Badge>
          </div>
          {description && (
            <p className="text-muted-foreground text-sm">
              {description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {schema.fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{italianContent.editor.noFieldsInPreview}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schema.fields.map((field, index) => (
                <div key={field.id}>
                  <PreviewField field={field} />
                  {index < schema.fields.length - 1 && (
                    <div className="border-t border-border my-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
