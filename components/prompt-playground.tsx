"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Copy, MoreVertical, RefreshCw, ExternalLink, DollarSign, FileText, Globe, Zap } from "lucide-react"
import { api, type Prompt, type PlaygroundRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ModelInfo {
  id: string
  name: string
  provider: string
  description: string
  contextWindow: string
  inputPrice: string
  outputPrice: string
  icon?: string
}

const MODEL_INFO: Record<string, ModelInfo> = {
  "openai/gpt-4": {
    id: "openai/gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    description: "Most capable GPT-4 model, better at complex tasks and produces higher quality outputs.",
    contextWindow: "8,192 tokens",
    inputPrice: "$0.03 / 1K tokens",
    outputPrice: "$0.06 / 1K tokens",
  },
  "openai/gpt-3.5-turbo": {
    id: "openai/gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    description: "Fast, inexpensive model for simple tasks. Great for quick iterations and testing.",
    contextWindow: "16,385 tokens",
    inputPrice: "$0.0005 / 1K tokens",
    outputPrice: "$0.0015 / 1K tokens",
  },
  "anthropic/claude-3-opus": {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    description: "Most powerful Claude model, excelling at complex analysis, coding, and creative tasks.",
    contextWindow: "200,000 tokens",
    inputPrice: "$0.015 / 1K tokens",
    outputPrice: "$0.075 / 1K tokens",
  },
  "anthropic/claude-3-sonnet": {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    description: "Balanced performance and speed. Ideal for enterprise workloads and scaled deployments.",
    contextWindow: "200,000 tokens",
    inputPrice: "$0.003 / 1K tokens",
    outputPrice: "$0.015 / 1K tokens",
  },
  "google/gemini-pro": {
    id: "google/gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    description: "Google's most capable model with multimodal understanding and generation capabilities.",
    contextWindow: "32,768 tokens",
    inputPrice: "$0.00025 / 1K tokens",
    outputPrice: "$0.0005 / 1K tokens",
  },
  "meta/llama-2-70b": {
    id: "meta/llama-2-70b",
    name: "Llama 2 70B",
    provider: "Meta",
    description: "Open-source model with strong performance across various tasks. Great for self-hosting.",
    contextWindow: "4,096 tokens",
    inputPrice: "$0.0007 / 1K tokens",
    outputPrice: "$0.0009 / 1K tokens",
  },
}

interface ModelPanelProps {
  model: string
  onModelChange: (model: string) => void
  response?: string
  loading?: boolean
  onCopy: () => void
  promptText?: string
  variables?: Record<string, string>
}

function ModelPanel({ model, onModelChange, response, loading, onCopy, promptText, variables }: ModelPanelProps) {
  const modelInfo = MODEL_INFO[model]
  const { toast } = useToast()

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response)
      toast({
        title: "Copied",
        description: "Response copied to clipboard",
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <Select value={model} onValueChange={onModelChange}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>
                  {modelInfo?.provider} / {modelInfo?.name}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MODEL_INFO).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>
                      {info.provider} / {info.name}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 ml-2">
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Model Documentation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Pricing Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Globe className="mr-2 h-4 w-4" />
                  Provider Website
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {modelInfo && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{modelInfo.description}</p>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">Context</p>
                <p className="text-muted-foreground">{modelInfo.contextWindow}</p>
              </div>
              <div>
                <p className="font-medium">Input Pricing</p>
                <p className="text-muted-foreground">{modelInfo.inputPrice}</p>
              </div>
              <div>
                <p className="font-medium">Output Pricing</p>
                <p className="text-muted-foreground">{modelInfo.outputPrice}</p>
              </div>
            </div>

            <div className="flex gap-4 text-sm">
              <a href="#" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <FileText className="h-3 w-3" />
                Model Page
                <ExternalLink className="h-3 w-3" />
              </a>
              <a href="#" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <DollarSign className="h-3 w-3" />
                Pricing
                <ExternalLink className="h-3 w-3" />
              </a>
              <a href="#" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <Globe className="h-3 w-3" />
                Website
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Generating response...</span>
            </div>
          </div>
        ) : response ? (
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg">{response}</pre>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">Response will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function PromptPlayground() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [leftModel, setLeftModel] = useState("openai/gpt-4")
  const [rightModel, setRightModel] = useState("anthropic/claude-3-opus")
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [syncModels, setSyncModels] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadPrompts()
  }, [])

  useEffect(() => {
    if (selectedPromptId) {
      const prompt = prompts.find((p) => p.id === selectedPromptId)
      if (prompt) {
        // Extract variables from prompt text
        const variableMatches = prompt.text.match(/\{\{(\w+)\}\}/g)
        if (variableMatches) {
          const vars = variableMatches.map((v) => v.replace(/\{\{|\}\}/g, ""))
          const newVariables: Record<string, string> = {}
          vars.forEach((v) => {
            newVariables[v] = variables[v] || ""
          })
          setVariables(newVariables)
        } else {
          setVariables({})
        }
      }
    }
  }, [selectedPromptId])

  const loadPrompts = async () => {
    try {
      const data = await api.getPrompts()
      setPrompts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive",
      })
    }
  }

  const handleTest = async () => {
    if (!selectedPromptId) {
      toast({
        title: "Error",
        description: "Please select a prompt",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResponses({})

    try {
      const models = syncModels ? [leftModel] : [leftModel, rightModel]
      const request: PlaygroundRequest = {
        prompt_id: selectedPromptId,
        version: selectedVersion,
        models: models,
        variables: Object.keys(variables).length > 0 ? variables : undefined,
      }

      const data = await api.testPlayground(request)

      if (syncModels) {
        // If synced, show the same response for both panels
        setResponses({
          [leftModel]: data.responses[leftModel],
          [rightModel]: data.responses[leftModel],
        })
      } else {
        setResponses(data.responses)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test prompt",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId)

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prompt Configuration</CardTitle>
              <CardDescription>Select a prompt and configure your test</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="sync" className="text-sm">
                Sync
              </Label>
              <Switch id="sync" checked={syncModels} onCheckedChange={setSyncModels} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="prompt">Select Prompt</Label>
              <Select
                value={selectedPromptId?.toString()}
                onValueChange={(value) => setSelectedPromptId(Number.parseInt(value))}
              >
                <SelectTrigger id="prompt">
                  <SelectValue placeholder="Choose a prompt" />
                </SelectTrigger>
                <SelectContent>
                  {prompts.map((prompt) => (
                    <SelectItem key={prompt.id} value={prompt.id.toString()}>
                      {prompt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPrompt && selectedPrompt.versions.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="version">Version</Label>
                <Select
                  value={selectedVersion?.toString() || selectedPrompt.version?.toString()}
                  onValueChange={(value) => setSelectedVersion(Number.parseInt(value))}
                >
                  <SelectTrigger id="version">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={selectedPrompt.version?.toString() || "1"}>
                      Current (v{selectedPrompt.version || 1})
                    </SelectItem>
                    {selectedPrompt.versions.map((version) => (
                      <SelectItem key={version.id} value={version.version.toString()}>
                        Version {version.version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {Object.keys(variables).length > 0 && (
            <div className="space-y-2">
              <Label>Variables</Label>
              <div className="grid gap-2 md:grid-cols-2">
                {Object.entries(variables).map(([key, value]) => (
                  <div key={key} className="grid gap-2">
                    <Label htmlFor={key} className="text-sm">
                      {key}
                    </Label>
                    <Input
                      id={key}
                      value={value}
                      onChange={(e) => setVariables({ ...variables, [key]: e.target.value })}
                      placeholder={`Enter value for ${key}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleTest} disabled={loading || !selectedPromptId} className="w-full">
            <Zap className="mr-2 h-4 w-4" />
            {loading ? "Testing..." : "Test Prompt"}
          </Button>
        </CardContent>
      </Card>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <Card className="overflow-hidden">
          <ModelPanel
            model={leftModel}
            onModelChange={setLeftModel}
            response={responses[leftModel]}
            loading={loading}
            onCopy={() => {}}
            promptText={selectedPrompt?.text}
            variables={variables}
          />
        </Card>

        <Card className="overflow-hidden">
          <ModelPanel
            model={rightModel}
            onModelChange={setRightModel}
            response={responses[rightModel]}
            loading={loading && !syncModels}
            onCopy={() => {}}
            promptText={selectedPrompt?.text}
            variables={variables}
          />
        </Card>
      </div>
    </div>
  )
}
