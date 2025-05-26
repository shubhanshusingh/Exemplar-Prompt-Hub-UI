// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

export type Prompt = {
  id: number
  name: string
  description: string | null
  text: string
  tags: { id: number; name: string }[]
  meta: Record<string, any> | null
  version: number
  versions: PromptVersion[]
}

export type PromptVersion = {
  id: number
  prompt_id: number
  version: number
  text: string
  meta: Record<string, any> | null
  created_at: string
}

export type PromptCreate = {
  name: string
  description: string | null
  text: string
  tags: string[]
  meta: Record<string, string> | null
}

export type PromptUpdate = {
  name: string
  description: string | null
  text: string
  tags: string[]
  meta: Record<string, string> | null
}

export const api = {
  async getPrompts(params?: { search?: string; tag?: string }): Promise<Prompt[]> {
    const url = new URL(`${API_BASE_URL}/api/v1/prompts`)
    if (params?.search) {
      url.searchParams.append("search", params.search)
    }
    if (params?.tag) {
      url.searchParams.append("tag", params.tag)
    }
    const response = await fetch(url.toString())
    if (!response.ok) throw new Error("Failed to fetch prompts")
    return response.json()
  },
  async getPrompt(id: string): Promise<Prompt> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts/${id}`)
    if (!response.ok) throw new Error("Failed to fetch prompt")
    return response.json()
  },
  async createPrompt(data: PromptCreate): Promise<Prompt> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create prompt")
    return response.json()
  },
  async updatePrompt(id: string, data: PromptUpdate): Promise<Prompt> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update prompt")
    return response.json()
  },
  async deletePrompt(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete prompt")
  },
  async getAvailableModels(): Promise<Record<string, any>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts/models`)
    if (!response.ok) throw new Error("Failed to fetch available models")
    return response.json()
  },
  async seedDatabase(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts/seed`, {
      method: "POST",
    })
    if (!response.ok) throw new Error("Failed to seed database")
  },
}
