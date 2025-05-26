"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PromptList } from "./prompt-list"
import { PromptPlayground } from "./prompt-playground"
import { Button } from "@/components/ui/button"
import { Database, Sparkles } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function PromptHub() {
  const [activeTab, setActiveTab] = useState("prompts")
  const { toast } = useToast()

  const handleSeedDatabase = async () => {
    try {
      await api.seedDatabase()
      toast({
        title: "Database seeded",
        description: "Sample prompts have been added to the database.",
      })
      // Refresh the prompt list
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed database",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Exemplar Prompt Hub</h1>
            </div>
            <Button onClick={handleSeedDatabase} variant="outline" size="sm">
              <Database className="mr-2 h-4 w-4" />
              Seed Database
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="playground">Playground</TabsTrigger>
          </TabsList>
          <TabsContent value="prompts" className="space-y-4">
            <PromptList />
          </TabsContent>
          <TabsContent value="playground" className="space-y-4">
            <PromptPlayground />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
