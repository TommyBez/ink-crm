'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import italianContent from '@/lib/constants/italian-content'
import type { TemplateField, TextField, DateField, CheckboxField } from '@/types/template'

interface FieldPropertiesProps {
  field: TemplateField
  onUpdate: (updates: Partial<TemplateField>) => void
}

export function FieldProperties({ field, onUpdate }: FieldPropertiesProps) {
  const handleTextPropertyChange = (property: keyof TextField, value: string | number) => {
    onUpdate({ [property]: value })
  }

  const handleDatePropertyChange = (property: keyof DateField, value: string) => {
    onUpdate({ [property]: value })
  }

  const handleCheckboxPropertyChange = (property: keyof CheckboxField, value: string) => {
    onUpdate({ [property]: value })
  }

  switch (field.type) {
    case 'text':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`field-placeholder-${field.id}`}>
              {italianContent.editor.placeholder}
            </Label>
            <Input
              id={`field-placeholder-${field.id}`}
              value={field.placeholder || ''}
              onChange={(e) => handleTextPropertyChange('placeholder', e.target.value)}
              placeholder={italianContent.editor.placeholderPlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`field-min-length-${field.id}`}>
                {italianContent.editor.minLength}
              </Label>
              <Input
                id={`field-min-length-${field.id}`}
                type="number"
                min="0"
                value={field.minLength || ''}
                onChange={(e) => handleTextPropertyChange('minLength', parseInt(e.target.value) || undefined)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`field-max-length-${field.id}`}>
                {italianContent.editor.maxLength}
              </Label>
              <Input
                id={`field-max-length-${field.id}`}
                type="number"
                min="1"
                value={field.maxLength || ''}
                onChange={(e) => handleTextPropertyChange('maxLength', parseInt(e.target.value) || undefined)}
                placeholder="255"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`field-pattern-${field.id}`}>
              {italianContent.editor.pattern}
            </Label>
            <Input
              id={`field-pattern-${field.id}`}
              value={field.pattern || ''}
              onChange={(e) => handleTextPropertyChange('pattern', e.target.value)}
              placeholder={italianContent.editor.patternPlaceholder}
            />
            <p className="text-muted-foreground text-xs">
              {italianContent.editor.patternHelp}
            </p>
          </div>
        </div>
      )

    case 'date':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`field-min-date-${field.id}`}>
                {italianContent.editor.minDate}
              </Label>
              <Input
                id={`field-min-date-${field.id}`}
                type="date"
                value={field.minDate || ''}
                onChange={(e) => handleDatePropertyChange('minDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`field-max-date-${field.id}`}>
                {italianContent.editor.maxDate}
              </Label>
              <Input
                id={`field-max-date-${field.id}`}
                type="date"
                value={field.maxDate || ''}
                onChange={(e) => handleDatePropertyChange('maxDate', e.target.value)}
              />
            </div>
          </div>
        </div>
      )

    case 'checkbox':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`field-checkbox-text-${field.id}`}>
              {italianContent.editor.checkboxText}
            </Label>
            <Textarea
              id={`field-checkbox-text-${field.id}`}
              value={field.text || ''}
              onChange={(e) => handleCheckboxPropertyChange('text', e.target.value)}
              placeholder={italianContent.editor.checkboxTextPlaceholder}
              rows={3}
            />
            <p className="text-muted-foreground text-xs">
              {italianContent.editor.checkboxTextHelp}
            </p>
          </div>
        </div>
      )

    case 'signature':
      return (
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-muted-foreground text-sm">
              {italianContent.editor.signatureFieldInfo}
            </p>
          </div>
        </div>
      )

    default:
      return null
  }
}
