"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Prompt, PromptVersion } from "@/lib/api"
import { format } from "date-fns"

interface VersionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: Prompt | null
}

export function VersionHistoryDialog({ open, onOpenChange, prompt }: VersionHistoryDialogProps) {
  const [versions, setVersions] = useState<PromptVersion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (prompt && open) {
      setVersions(prompt.versions || [])
    }
  }, [prompt, open])

  if (!prompt) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Version History: {prompt.name}</DialogTitle>
          <DialogDescription>View all versions of this prompt</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {versions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No version history available</p>
            ) : (
              versions.map((version) => (
                <Card key={version.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <Badge>Version {version.version}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(version.created_at), "PPp")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">{version.text}</pre>
                    {version.meta && Object.keys(version.meta).length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Metadata:</p>
                        <div className="space-y-1">
                          {Object.entries(version.meta).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="text-xs">
                                {key}
                              </Badge>
                              <span className="text-muted-foreground">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
