"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { api, type Prompt, type PromptCreate, type PromptUpdate } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: Prompt | null
  onSuccess: () => void
}

export function PromptDialog({ open, onOpenChange, prompt, onSuccess }: PromptDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    text: "",
    tags: [] as string[],
    meta: {} as Record<string, string>,
  })
  const [tagInput, setTagInput] = useState("")
  const [metaKey, setMetaKey] = useState("")
  const [metaValue, setMetaValue] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (prompt) {
      setFormData({
        name: prompt.name,
        description: prompt.description || "",
        text: prompt.text,
        tags: prompt.tags.map((t) => t.name),
        meta: prompt.meta ? Object.fromEntries(Object.entries(prompt.meta).map(([k, v]) => [k, String(v)])) : {},
      })
    } else {
      setFormData({
        name: "",
        description: "",
        text: "",
        tags: [],
        meta: {},
      })
    }
  }, [prompt])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (prompt) {
        const updateData: PromptUpdate = {
          name: formData.name,
          description: formData.description || null,
          text: formData.text,
          tags: formData.tags,
          meta: Object.keys(formData.meta).length > 0 ? formData.meta : null,
        }
        await api.updatePrompt(prompt.id, updateData)
        toast({
          title: "Success",
          description: "Prompt updated successfully",
        })
      } else {
        const createData: PromptCreate = {
          name: formData.name,
          description: formData.description || null,
          text: formData.text,
          tags: formData.tags,
          meta: Object.keys(formData.meta).length > 0 ? formData.meta : null,
        }
        await api.createPrompt(createData)
        toast({
          title: "Success",
          description: "Prompt created successfully",
        })
      }
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${prompt ? "update" : "create"} prompt`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] })
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  const addMeta = () => {
    if (metaKey && metaValue && !formData.meta[metaKey]) {
      setFormData({
        ...formData,
        meta: { ...formData.meta, [metaKey]: metaValue },
      })
      setMetaKey("")
      setMetaValue("")
    }
  }

  const removeMeta = (key: string) => {
    const newMeta = { ...formData.meta }
    delete newMeta[key]
    setFormData({ ...formData, meta: newMeta })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg sm:text-xl">{prompt ? "Edit Prompt" : "Create New Prompt"}</DialogTitle>
            <DialogDescription className="text-sm">
              {prompt ? "Update the prompt details below" : "Fill in the details for your new prompt"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                className="w-full text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="text" className="text-sm">Prompt Text</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                rows={6}
                required
                placeholder="Enter your prompt text here. You can use {{variables}} for dynamic content."
                className="w-full text-sm resize-y min-h-[150px] sm:min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-sm">Tags</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  className="w-full text-sm"
                />
                <Button type="button" onClick={addTag} variant="secondary" className="w-full sm:w-auto text-sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta" className="text-sm">Metadata</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="meta-key"
                  value={metaKey}
                  onChange={(e) => setMetaKey(e.target.value)}
                  placeholder="Key"
                  className="w-full text-sm"
                />
                <Input
                  id="meta-value"
                  value={metaValue}
                  onChange={(e) => setMetaValue(e.target.value)}
                  placeholder="Value"
                  className="w-full text-sm"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addMeta()
                    }
                  }}
                />
                <Button type="button" onClick={addMeta} variant="secondary" className="w-full sm:w-auto text-sm">
                  Add
                </Button>
              </div>
              {Object.keys(formData.meta).length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {Object.entries(formData.meta).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                      <div className="flex-1 min-w-0 mr-2">
                        <span className="font-medium">{key}:</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="ml-1 text-muted-foreground truncate inline-block max-w-[200px]">
                                {value}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[300px] break-words">
                              {value}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <button type="button" onClick={() => removeMeta(key)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto text-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto text-sm">
              {loading ? "Saving..." : prompt ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
