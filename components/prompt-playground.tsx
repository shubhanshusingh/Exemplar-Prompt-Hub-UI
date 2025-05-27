"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Copy, MoreVertical, RefreshCw, ExternalLink, DollarSign, FileText, Globe, Zap, Info, Eye } from "lucide-react"
import { api, type Prompt, type PlaygroundRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ModelInfo {
  id: string
  hugging_face_id?: string
  name: string
  provider: string
  description: string
  contextWindow: string
  inputPrice: string
  outputPrice: string
  icon?: string
  created?: number
  context_length?: number
  architecture?: {
    modality: string
    input_modalities: string[]
    output_modalities: string[]
    tokenizer: string
    instruct_type: string | null
  }
  pricing?: {
    prompt: string
    completion: string
    request: string
    image: string
    web_search: string
    internal_reasoning: string
  }
  top_provider?: {
    context_length: number
    max_completion_tokens: number | null
    is_moderated: boolean
  }
  per_request_limits?: any
  supported_parameters?: string[]
}

// Fallback model info in case API fails
const FALLBACK_MODEL_INFO: Record<string, ModelInfo> = {
  "openai/gpt-4": {
    id: "openai/gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    description: "Most capable GPT-4 model, better at complex tasks and produces higher quality outputs.",
    contextWindow: "8,192 tokens",
    inputPrice: "$0.03 / 1K tokens",
    outputPrice: "$0.06 / 1K tokens",
    context_length: 8192,
    architecture: {
      modality: "text->text",
      input_modalities: ["text"],
      output_modalities: ["text"],
      tokenizer: "GPT",
      instruct_type: "chat"
    },
    pricing: {
      prompt: "0.03",
      completion: "0.06",
      request: "0",
      image: "0",
      web_search: "0",
      internal_reasoning: "0"
    },
    top_provider: {
      context_length: 8192,
      max_completion_tokens: null,
      is_moderated: true
    },
    supported_parameters: [
      "max_tokens",
      "temperature",
      "top_p",
      "stop",
      "frequency_penalty",
      "presence_penalty"
    ]
  },
  "openai/gpt-3.5-turbo": {
    id: "openai/gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    description: "Fast, inexpensive model for simple tasks. Great for quick iterations and testing.",
    contextWindow: "16,385 tokens",
    inputPrice: "$0.0005 / 1K tokens",
    outputPrice: "$0.0015 / 1K tokens",
    context_length: 16385,
    architecture: {
      modality: "text->text",
      input_modalities: ["text"],
      output_modalities: ["text"],
      tokenizer: "GPT",
      instruct_type: "chat"
    },
    pricing: {
      prompt: "0.0005",
      completion: "0.0015",
      request: "0",
      image: "0",
      web_search: "0",
      internal_reasoning: "0"
    },
    top_provider: {
      context_length: 16385,
      max_completion_tokens: null,
      is_moderated: true
    },
    supported_parameters: [
      "max_tokens",
      "temperature",
      "top_p",
      "stop",
      "frequency_penalty",
      "presence_penalty"
    ]
  },
  "anthropic/claude-3-opus": {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    description: "Most powerful Claude model, excelling at complex analysis, coding, and creative tasks.",
    contextWindow: "200,000 tokens",
    inputPrice: "$0.015 / 1K tokens",
    outputPrice: "$0.075 / 1K tokens",
    context_length: 200000,
    architecture: {
      modality: "text->text",
      input_modalities: ["text"],
      output_modalities: ["text"],
      tokenizer: "Claude",
      instruct_type: "chat"
    },
    pricing: {
      prompt: "0.015",
      completion: "0.075",
      request: "0",
      image: "0",
      web_search: "0",
      internal_reasoning: "0"
    },
    top_provider: {
      context_length: 200000,
      max_completion_tokens: null,
      is_moderated: true
    },
    supported_parameters: [
      "max_tokens",
      "temperature",
      "top_p",
      "stop",
      "frequency_penalty",
      "presence_penalty"
    ]
  },
  "anthropic/claude-3-sonnet": {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    description: "Balanced performance and speed. Ideal for enterprise workloads and scaled deployments.",
    contextWindow: "200,000 tokens",
    inputPrice: "$0.003 / 1K tokens",
    outputPrice: "$0.015 / 1K tokens",
    context_length: 200000,
    architecture: {
      modality: "text->text",
      input_modalities: ["text"],
      output_modalities: ["text"],
      tokenizer: "Claude",
      instruct_type: "chat"
    },
    pricing: {
      prompt: "0.003",
      completion: "0.015",
      request: "0",
      image: "0",
      web_search: "0",
      internal_reasoning: "0"
    },
    top_provider: {
      context_length: 200000,
      max_completion_tokens: null,
      is_moderated: true
    },
    supported_parameters: [
      "max_tokens",
      "temperature",
      "top_p",
      "stop",
      "frequency_penalty",
      "presence_penalty"
    ]
  }
}

interface ModelPanelProps {
  model: string
  onModelChange: (model: string) => void
  response?: string
  loading?: boolean
  onCopy: () => void
  promptText?: string
  variables?: Record<string, string>
  availableModels: Record<string, ModelInfo>
}

function ModelPanel({
  model,
  onModelChange,
  response,
  loading,
  onCopy,
  promptText,
  variables,
  availableModels,
}: ModelPanelProps) {
  const modelInfo = availableModels[model] || {
    id: model,
    name: model,
    provider: model || "Unknown",
    description: "No description available",
    contextWindow: "Unknown",
    inputPrice: "Varies",
    outputPrice: "Varies",
  }

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
    <div className="flex flex-col h-full overflow-auto">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <Select value={model} onValueChange={onModelChange}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>
                  {modelInfo?.name}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(availableModels).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>
                      {info.id}
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm text-muted-foreground line-clamp-2 cursor-help">
                    {modelInfo.description}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px]">
                  <p className="text-sm">{modelInfo.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

            {modelInfo.architecture && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Modality</p>
                  <p className="text-muted-foreground">{modelInfo.architecture.modality}</p>
                </div>
                <div>
                  <p className="font-medium">Tokenizer</p>
                  <p className="text-muted-foreground">{modelInfo.architecture.tokenizer}</p>
                </div>
              </div>
            )}

            {modelInfo.supported_parameters && modelInfo.supported_parameters.length > 0 && (
              <div className="text-sm">
                <p className="font-medium mb-2">Supported Parameters</p>
                <div className="flex flex-wrap gap-2">
                  {modelInfo.supported_parameters.map((param) => (
                    <Badge key={param} variant="secondary" className="text-xs">
                      {param}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

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
          <div className="prose prose-sm max-w-none h-full">
            <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg h-full overflow-auto">
              {response}
            </pre>
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

interface PlaygroundResponse {
  response: string
}

interface ApiResponse {
  responses: Record<string, { response: string }>
}

export function PromptPlayground() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [leftModel, setLeftModel] = useState("openai/gpt-4")
  const [rightModel, setRightModel] = useState("anthropic/claude-3-opus")
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [responses, setResponses] = useState<Record<string, PlaygroundResponse>>({})
  const [syncModels, setSyncModels] = useState(false)
  const [availableModels, setAvailableModels] = useState<Record<string, ModelInfo>>(FALLBACK_MODEL_INFO)
  const [loadingModels, setLoadingModels] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadPrompts()
    loadModels()
  }, [])

  useEffect(() => {
    if (selectedPromptId) {
      const prompt = prompts.find((p) => p.id === selectedPromptId)
      if (prompt) {
        // Extract variables from prompt text using regex
        const variableMatches = prompt.text.match(/\{\{([^}]+)\}\}/g)
        if (prompt.meta && prompt.meta.template_variables) {
          // const vars = variableMatches.map((v) => v.replace(/\{\{|\}\}/g, ""))
          const newVariables: Record<string, string> = {}
          prompt.meta.template_variables.forEach((v) => {
            // Preserve existing values if they exist
            newVariables[v] = variables[v] || ""
          })
          setVariables(newVariables)
        } else {
          setVariables({})
        }
      }
    }
  }, [selectedPromptId, prompts])

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

  const loadModels = async () => {
    try {
      setLoadingModels(true)
      const data = await api.getAvailableModels()

      // Transform the API response into our ModelInfo format
      const modelData: Record<string, ModelInfo> = {}

      // Process the model data from the API
      Object.entries(data.data.slice(0, 10)).forEach(([id, details]: [string, any]) => {
        modelData[details.id] = {
          id: details.id,
          hugging_face_id: details.hugging_face_id,
          name: details.name  || id,
          provider: details.provider || "Unknown",
          description: details.description || "No description available",
          contextWindow: `${details.context_length?.toLocaleString() || "Unknown"} tokens`,
          inputPrice: details.pricing?.prompt ? `$${details.pricing.prompt} / 1K tokens` : "Varies",
          outputPrice: details.pricing?.completion ? `$${details.pricing.completion} / 1K tokens` : "Varies",
          created: details.created,
          context_length: details.context_length,
          architecture: details.architecture,
          pricing: details.pricing,
          top_provider: details.top_provider,
          per_request_limits: details.per_request_limits,
          supported_parameters: details.supported_parameters
        }
      })

      setAvailableModels(modelData)

      // Set default models based on what's available
      if (Object.keys(modelData).length > 0) {
        const models = Object.keys(modelData)
        if (models.includes("openai/gpt-4")) {
          setLeftModel("openai/gpt-4")
        } else {
          setLeftModel(models[0])
        }

        if (models.includes("anthropic/claude-3-opus")) {
          setRightModel("anthropic/claude-3-opus")
        } else if (models.length > 1) {
          setRightModel(models[1])
        } else {
          setRightModel(models[0])
        }
      }
    } catch (error) {
      console.error("Failed to load models:", error)
      toast({
        title: "Error",
        description: "Failed to load available models",
        variant: "destructive",
      })

      // Fallback to hardcoded models if API fails
      setAvailableModels(FALLBACK_MODEL_INFO)
    } finally {
      setLoadingModels(false)
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
      // Always request responses from both models
      const request: PlaygroundRequest = {
        prompt_id: selectedPromptId,
        version: selectedVersion || undefined,
        models: [leftModel, rightModel],
        variables: Object.keys(variables).length > 0 ? variables : undefined,
      }

      const response = await api.testPlayground(request)
      const data = response as unknown as ApiResponse

      // Set responses for both models
      setResponses({
        [leftModel]: { response: data.responses[leftModel]?.response || "" },
        [rightModel]: { response: data.responses[rightModel]?.response || "" },
      })
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
    <div className="flex flex-col min-h-screen w-full overflow-auto">
      <Card className="mb-4 flex-shrink-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prompt Configuration</CardTitle>
              <CardDescription>Select a prompt and configure your test</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="sync" className="text-sm">
                  Sync
                </Label>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="z-50">
                      <p className="max-w-xs">
                        When enabled, both panels will use the same input prompt, but each model will generate its own unique response. This allows you to compare how different models handle the same input.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Switch id="sync" checked={syncModels} onCheckedChange={setSyncModels} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="prompt">Select Prompt</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedPromptId?.toString()}
                  onValueChange={(value) => setSelectedPromptId(Number.parseInt(value))}
                >
                  <SelectTrigger id="prompt" className="flex-1">
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" disabled={!selectedPrompt}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{selectedPrompt?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Prompt Text</h4>
                        <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                          {selectedPrompt?.text}
                        </pre>
                      </div>
                      {selectedPrompt?.description && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">{selectedPrompt.description}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Variables</h4>
                        {Object.keys(variables).length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(variables).map((key) => (
                              <Badge key={key} variant="secondary">
                                {`{{${key}}}`}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No variables found in this prompt</p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 min-h-0">
        <Card className="overflow-hidden flex flex-col">
          <ModelPanel
            model={leftModel}
            onModelChange={setLeftModel}
            response={responses[leftModel]?.response}
            loading={loading}
            onCopy={() => {}}
            promptText={selectedPrompt?.text}
            variables={variables}
            availableModels={availableModels}
          />
        </Card>

        <Card className="overflow-hidden flex flex-col">
          <ModelPanel
            model={rightModel}
            onModelChange={setRightModel}
            response={responses[rightModel]?.response}
            loading={loading && !syncModels}
            onCopy={() => {}}
            promptText={selectedPrompt?.text}
            variables={variables}
            availableModels={availableModels}
          />
        </Card>
      </div>
    </div>
  )
}
