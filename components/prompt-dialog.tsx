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
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{prompt ? "Edit Prompt" : "Create New Prompt"}</DialogTitle>
            <DialogDescription>
              {prompt ? "Update the prompt details below" : "Fill in the details for your new prompt"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="text">Prompt Text</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                rows={8}
                required
                placeholder="Enter your prompt text here. You can use {{variables}} for dynamic content."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
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
                />
                <Button type="button" onClick={addTag} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meta">Metadata</Label>
              <div className="flex gap-2">
                <Input
                  id="meta-key"
                  value={metaKey}
                  onChange={(e) => setMetaKey(e.target.value)}
                  placeholder="Key"
                  className="flex-1"
                />
                <Input
                  id="meta-value"
                  value={metaValue}
                  onChange={(e) => setMetaValue(e.target.value)}
                  placeholder="Value"
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addMeta()
                    }
                  }}
                />
                <Button type="button" onClick={addMeta} variant="secondary">
                  Add
                </Button>
              </div>
              {Object.keys(formData.meta).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(formData.meta).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-muted p-2 rounded">
                      <div className="flex-1">
                        <span className="font-medium text-sm">{key}:</span>
                        <span className="ml-2 text-sm">{value}</span>
                      </div>
                      <button type="button" onClick={() => removeMeta(key)} className="ml-2 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : prompt ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
