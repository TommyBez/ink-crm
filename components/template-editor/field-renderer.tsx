'use client'

import { useState } from 'react'
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  GripVertical,
  FileText,
  Calendar,
  CheckSquare,
  PenTool
} from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FieldProperties } from './field-properties'
import italianContent from '@/lib/constants/italian-content'
import type { TemplateField } from '@/types/template'

interface FieldRendererProps {
  field: TemplateField
  onUpdate: (updates: Partial<TemplateField>) => void
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

const fieldIcons = {
  text: FileText,
  date: Calendar,
  checkbox: CheckSquare,
  signature: PenTool,
}

export function FieldRenderer({ 
  field, 
  onUpdate, 
  onRemove, 
  onMoveUp, 
  onMoveDown 
}: FieldRendererProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const Icon = fieldIcons[field.type]

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleLabelChange = (value: string) => {
    onUpdate({ label: value })
  }

  const handleRequiredChange = (required: boolean) => {
    onUpdate({ required })
  }

  const handleHelpTextChange = (helpText: string) => {
    onUpdate({ helpText: helpText || undefined })
  }

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`group ${isDragging ? 'opacity-50' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">
                {field.label || `Campo ${field.type}`}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {italianContent.editor.fieldType[field.type]}
                {field.required && (
                  <span className="ml-2 text-primary text-xs">
                    ({italianContent.app.required})
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveUp}
                className="h-8 w-8 p-0"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
            {onMoveDown && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveDown}
                className="h-8 w-8 p-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? '−' : '+'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Basic Properties */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`field-label-${field.id}`}>
                {italianContent.editor.fieldLabel} *
              </Label>
              <Input
                id={`field-label-${field.id}`}
                value={field.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder={italianContent.editor.fieldLabelPlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`field-help-${field.id}`}>
                {italianContent.editor.helpText}
              </Label>
              <Textarea
                id={`field-help-${field.id}`}
                value={field.helpText || ''}
                onChange={(e) => handleHelpTextChange(e.target.value)}
                placeholder={italianContent.editor.helpTextPlaceholder}
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id={`field-required-${field.id}`}
                checked={field.required || false}
                onCheckedChange={handleRequiredChange}
              />
              <Label htmlFor={`field-required-${field.id}`}>
                {italianContent.editor.required}
              </Label>
            </div>
          </div>

          {/* Type-specific Properties */}
          <FieldProperties field={field} onUpdate={onUpdate} />
        </CardContent>
      )}
    </Card>
  )
}
