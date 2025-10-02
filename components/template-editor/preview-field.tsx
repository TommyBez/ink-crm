'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PenTool } from 'lucide-react'
import italianContent from '@/lib/constants/italian-content'
import type { TemplateField } from '@/types/template'

interface PreviewFieldProps {
  field: TemplateField
}

export function PreviewField({ field }: PreviewFieldProps) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder || italianContent.editor.textFieldPlaceholder}
            disabled
            className="bg-muted/50"
          />
        )

      case 'date':
        return (
          <Input
            type="date"
            disabled
            className="bg-muted/50"
          />
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox disabled />
            <Label className="text-sm text-muted-foreground">
              {field.text || italianContent.editor.checkboxFieldPlaceholder}
            </Label>
          </div>
        )

      case 'signature':
        return (
          <Card className="border-dashed">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                <PenTool className="h-8 w-8" />
                <p className="text-sm">
                  {italianContent.editor.signatureFieldPlaceholder}
                </p>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {field.label}
        {field.required && (
          <span className="text-destructive ml-1">*</span>
        )}
      </Label>
      
      {field.helpText && (
        <p className="text-muted-foreground text-xs">
          {field.helpText}
        </p>
      )}
      
      {renderField()}
    </div>
  )
}
