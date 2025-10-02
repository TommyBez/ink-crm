'use client'

import { FileText, Calendar, CheckSquare, PenTool } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import italianContent from '@/lib/constants/italian-content'
import type { TemplateField } from '@/types/template'

interface FieldPaletteProps {
  onAddField: (fieldType: TemplateField['type']) => void
}

const fieldTypes = [
  {
    type: 'text' as const,
    label: italianContent.editor.fieldType.text,
    description: italianContent.editor.fieldTypeDescription.text,
    icon: FileText,
  },
  {
    type: 'date' as const,
    label: italianContent.editor.fieldType.date,
    description: italianContent.editor.fieldTypeDescription.date,
    icon: Calendar,
  },
  {
    type: 'checkbox' as const,
    label: italianContent.editor.fieldType.checkbox,
    description: italianContent.editor.fieldTypeDescription.checkbox,
    icon: CheckSquare,
  },
  {
    type: 'signature' as const,
    label: italianContent.editor.fieldType.signature,
    description: italianContent.editor.fieldTypeDescription.signature,
    icon: PenTool,
  },
]

interface DraggableFieldTypeProps {
  fieldType: typeof fieldTypes[0]
  onAddField: (fieldType: TemplateField['type']) => void
}

function DraggableFieldType({ fieldType, onAddField }: DraggableFieldTypeProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `field-type-${fieldType.type}`,
    data: {
      type: 'field-type',
      fieldType: fieldType.type,
    },
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <Button
      ref={setNodeRef}
      style={style}
      variant="outline"
      className={`w-full justify-start h-auto p-3 ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => onAddField(fieldType.type)}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-3">
        <fieldType.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div className="text-left">
          <div className="font-medium text-sm">
            {fieldType.label}
          </div>
          <div className="text-muted-foreground text-xs">
            {fieldType.description}
          </div>
        </div>
      </div>
    </Button>
  )
}

export function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {italianContent.editor.fieldTypes}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {fieldTypes.map((fieldType) => (
          <DraggableFieldType
            key={fieldType.type}
            fieldType={fieldType}
            onAddField={onAddField}
          />
        ))}
      </CardContent>
    </Card>
  )
}
