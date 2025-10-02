'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Eye, ArrowLeft } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { FieldPalette } from './field-palette'
import { FieldRenderer } from './field-renderer'
import { TemplatePreview } from './template-preview'
import { saveTemplateAction } from '@/app/actions/template'
import italianContent from '@/lib/constants/italian-content'
import type { Template, TemplateSchema, TemplateField } from '@/types/template'

interface TemplateEditorProps {
  studioId: string
  template?: Template
}

interface DroppableFieldsAreaProps {
  children: React.ReactNode
}

function DroppableFieldsArea({ children }: DroppableFieldsAreaProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'fields-drop-zone',
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] transition-colors ${
        isOver ? 'bg-primary/5 border-2 border-dashed border-primary rounded-lg' : ''
      }`}
    >
      {children}
    </div>
  )
}

export function TemplateEditor({ studioId, template }: TemplateEditorProps) {
  const router = useRouter()
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Template metadata
  const [name, setName] = useState(template?.name || '')
  const [description, setDescription] = useState(template?.description || '')
  const [isDefault, setIsDefault] = useState(template?.is_default || false)
  
  // Template schema
  const [schema, setSchema] = useState<TemplateSchema>(
    template?.schema || { fields: [] }
  )

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const addField = useCallback((fieldType: TemplateField['type']) => {
    const newField: TemplateField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      label: `Nuovo campo ${fieldType}`,
      required: false,
    }

    setSchema(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
  }, [])

  const updateField = useCallback((fieldId: string, updates: Partial<TemplateField>) => {
    setSchema(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }, [])

  const removeField = useCallback((fieldId: string) => {
    setSchema(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
  }, [])

  const moveField = useCallback((fromIndex: number, toIndex: number) => {
    setSchema(prev => {
      const newFields = [...prev.fields]
      const [movedField] = newFields.splice(fromIndex, 1)
      newFields.splice(toIndex, 0, movedField)
      return {
        ...prev,
        fields: newFields
      }
    })
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    // Handle field type drops from palette
    if (active.data.current?.type === 'field-type' && over.id === 'fields-drop-zone') {
      const fieldType = active.data.current.fieldType
      addField(fieldType)
      return
    }

    // Handle field reordering
    if (active.id !== over.id) {
      setSchema(prev => {
        const oldIndex = prev.fields.findIndex(field => field.id === active.id)
        const newIndex = prev.fields.findIndex(field => field.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          return {
            ...prev,
            fields: arrayMove(prev.fields, oldIndex, newIndex)
          }
        }
        return prev
      })
    }
  }, [addField])

  const handleSave = async () => {
    if (!name.trim()) {
      alert(italianContent.templates.validation.nameRequired)
      return
    }

    if (schema.fields.length === 0) {
      alert(italianContent.templates.validation.atLeastOneField)
      return
    }

    const hasSignatureField = schema.fields.some(field => field.type === 'signature')
    if (!hasSignatureField) {
      alert(italianContent.templates.validation.signatureRequired)
      return
    }

    setIsSaving(true)

    try {
      const templateData = {
        studio_id: studioId,
        name: name.trim(),
        description: description.trim() || undefined,
        schema,
        is_default: isDefault,
      }

      if (template) {
        // Update existing template
        await saveTemplateAction(template.id, templateData)
      } else {
        // Create new template
        await saveTemplateAction(null, templateData)
      }

      router.push('/studio/templates')
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Errore durante il salvataggio del template')
    } finally {
      setIsSaving(false)
    }
  }

  if (isPreviewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(false)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {italianContent.app.back}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPreviewMode(false)}
            >
              {italianContent.app.edit}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? italianContent.app.loading : italianContent.app.save}
            </Button>
          </div>
        </div>

        <TemplatePreview
          name={name}
          description={description}
          schema={schema}
        />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Left Sidebar - Field Palette */}
      <div className="lg:col-span-1">
        <FieldPalette onAddField={addField} />
      </div>

      {/* Main Content - Template Editor */}
      <div className="lg:col-span-2 space-y-6">
        {/* Template Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>{italianContent.editor.templateInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">
                {italianContent.templates.templateName} *
              </Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={italianContent.editor.templateNamePlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">
                {italianContent.templates.templateDescription}
              </Label>
              <Textarea
                id="template-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={italianContent.editor.templateDescriptionPlaceholder}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
              <Label htmlFor="is-default">
                {italianContent.editor.setAsDefault}
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Template Fields */}
        <Card>
          <CardHeader>
            <CardTitle>{italianContent.editor.templateFields}</CardTitle>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <DroppableFieldsArea>
                {schema.fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{italianContent.editor.noFields}</p>
                    <p className="text-sm">{italianContent.editor.dragFieldsFromSidebar}</p>
                  </div>
                ) : (
                  <SortableContext
                    items={schema.fields.map(field => field.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {schema.fields.map((field, index) => (
                        <div key={field.id}>
                          <FieldRenderer
                            field={field}
                            onUpdate={(updates) => updateField(field.id, updates)}
                            onRemove={() => removeField(field.id)}
                            onMoveUp={index > 0 ? () => moveField(index, index - 1) : undefined}
                            onMoveDown={index < schema.fields.length - 1 ? () => moveField(index, index + 1) : undefined}
                          />
                          {index < schema.fields.length - 1 && <Separator className="my-4" />}
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                )}
              </DroppableFieldsArea>
            </DndContext>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Actions */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>{italianContent.app.actions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsPreviewMode(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {italianContent.templates.preview}
            </Button>

            <Button
              className="w-full"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? italianContent.app.loading : italianContent.app.save}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/studio/templates')}
            >
              {italianContent.app.cancel}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
