const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface Prompt {
  id: number
  name: string
  text: string
  description?: string | null
  version?: number | null
  meta?: Record<string, any> | null
  created_at: string
  updated_at?: string | null
  tags: Tag[]
  versions: PromptVersion[]
}

export interface Tag {
  id: number
  name: string
}

export interface PromptVersion {
  id: number
  prompt_id: number
  version: number
  text: string
  meta?: Record<string, any> | null
  created_at: string
}

export interface PromptCreate {
  name: string
  text: string
  description?: string | null
  version?: number | null
  meta?: Record<string, any> | null
  tags?: string[] | null
}

export interface PromptUpdate {
  name?: string | null
  text?: string | null
  description?: string | null
  version?: number | null
  meta?: Record<string, any> | null
  tags?: string[] | null
}

export interface PlaygroundRequest {
  prompt_id: number
  version?: number | null
  models?: string[]
  variables?: Record<string, any> | null
}

export interface PlaygroundResponse {
  prompt_id: number
  prompt_name: string
  prompt_version: number
  variables_used?: Record<string, any> | null
  responses: Record<string, string>
}

export const api = {
  async getPrompts(params?: {
    skip?: number
    limit?: number
    search?: string
    tag?: string
  }): Promise<Prompt[]> {
    const queryParams = new URLSearchParams()
    if (params?.skip !== undefined) queryParams.append("skip", params.skip.toString())
    if (params?.limit !== undefined) queryParams.append("limit", params.limit.toString())
    if (params?.search) queryParams.append("search", params.search)
    if (params?.tag) queryParams.append("tag", params.tag)

    const response = await fetch(`${API_BASE_URL}/api/v1/prompts?${queryParams}`)
    if (!response.ok) throw new Error("Failed to fetch prompts")
    return response.json()
  },

  async getPrompt(id: number): Promise<Prompt> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts/${id}`)
    if (!response.ok) throw new Error("Failed to fetch prompt")
    return response.json()
  },

  async createPrompt(prompt: PromptCreate): Promise<Prompt> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prompt),
    })
    if (!response.ok) throw new Error("Failed to create prompt")
    return response.json()
  },

  async updatePrompt(id: number, prompt: PromptUpdate): Promise<Prompt> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prompt),
    })
    if (!response.ok) throw new Error("Failed to update prompt")
    return response.json()
  },

  async deletePrompt(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete prompt")
  },

  async getPromptVersion(promptId: number, version: number): Promise<PromptVersion> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts/${promptId}/versions/${version}`)
    if (!response.ok) throw new Error("Failed to fetch prompt version")
    return response.json()
  },

  async testPlayground(request: PlaygroundRequest): Promise<PlaygroundResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts/playground`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error("Failed to test prompt")
    return response.json()
  },

  async seedDatabase(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts/seed`, {
      method: "POST",
    })
    if (!response.ok) throw new Error("Failed to seed database")
  },

  async getAvailableModels(): Promise<Record<string, any>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prompts/models`)
    if (!response.ok) throw new Error("Failed to fetch available models")
    return response.json()
  },
}
