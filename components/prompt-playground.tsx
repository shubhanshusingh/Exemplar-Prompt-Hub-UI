"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

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

interface Prompt {
  id: number
  name: string
  description: string
}

const MODEL_INFO: Record<string, ModelInfo> = {
  "openai/gpt-4": {
    id: "openai/gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    description: "The most powerful model from OpenAI.",
    contextWindow: "8k",
    inputPrice: "Varies",
    outputPrice: "Varies",
  },
  "anthropic/claude-3-opus": {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    description: "The most powerful model from Anthropic.",
    contextWindow: "200k",
    inputPrice: "Varies",
    outputPrice: "Varies",
  },
}

const api = {
  getAvailableModels: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MODEL_INFO)
      }, 500)
    })
  },
}

const loadPrompts = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([])
    }, 500)
  })
}

// Make sure the component is properly exported
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
  const [availableModels, setAvailableModels] = useState<Record<string, ModelInfo>>({})
  const [loadingModels, setLoadingModels] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadPrompts()
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      setLoadingModels(true)
      const data = await api.getAvailableModels()

      // Transform the API response into our ModelInfo format
      const modelData: Record<string, ModelInfo> = {}

      // Process the model data from the API
      // This assumes the API returns a structure we can transform
      // You may need to adjust this based on the actual API response format
      Object.entries(data).forEach(([id, details]: [string, any]) => {
        modelData[id] = {
          id,
          name: details.name || id.split("/").pop() || id,
          provider: details.provider || id.split("/")[0] || "Unknown",
          description: details.description || "No description available",
          contextWindow: details.context_window || "Unknown",
          inputPrice: details.input_price || "Varies",
          outputPrice: details.output_price || "Varies",
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
      toast({
        title: "Error",
        description: "Failed to load available models",
        variant: "destructive",
      })

      // Fallback to hardcoded models if API fails
      setAvailableModels(MODEL_INFO)
    } finally {
      setLoadingModels(false)
    }
  }

  // Rest of the component remains the same...
}
