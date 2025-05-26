"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, History } from "lucide-react"
import { api, type Prompt } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PromptDialog } from "./prompt-dialog"
import { VersionHistoryDialog } from "./version-history-dialog"

export function PromptList() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [versionDialogOpen, setVersionDialogOpen] = useState(false)
  const [selectedPromptForVersions, setSelectedPromptForVersions] = useState<Prompt | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadPrompts()
  }, [search, selectedTag])

  const loadPrompts = async () => {
    try {
      setLoading(true)
      const data = await api.getPrompts({
        search: search || undefined,
        tag: selectedTag || undefined,
      })
      setPrompts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return

    try {
      await api.deletePrompt(id)
      toast({
        title: "Success",
        description: "Prompt deleted successfully",
      })
      loadPrompts()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingPrompt(null)
    setDialogOpen(true)
  }

  const handleViewVersions = (prompt: Prompt) => {
    setSelectedPromptForVersions(prompt)
    setVersionDialogOpen(true)
  }

  const allTags = Array.from(new Set(prompts.flatMap((p) => p.tags.map((t) => t.name))))

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Prompt
        </Button>
      </div>

      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={selectedTag === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedTag(null)}
          >
            All
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : prompts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No prompts found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle>{prompt.name}</CardTitle>
                    <CardDescription>{prompt.description || "No description"}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleViewVersions(prompt)}>
                      <History className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(prompt)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(prompt.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-3">{prompt.text}</p>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {prompt.tags.map((tag) => (
                          <Badge key={tag.id} variant="secondary">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                      {prompt.meta && Object.keys(prompt.meta).length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {Object.entries(prompt.meta).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">v{prompt.version || 1}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PromptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prompt={editingPrompt}
        onSuccess={() => {
          setDialogOpen(false)
          loadPrompts()
        }}
      />

      <VersionHistoryDialog
        open={versionDialogOpen}
        onOpenChange={setVersionDialogOpen}
        prompt={selectedPromptForVersions}
      />
    </div>
  )
}
