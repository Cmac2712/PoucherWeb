export interface AppConfig {
  serverEndpoint: string
  getToken: () => Promise<string | null>
}

let config: AppConfig | null = null

export function initApiClient(c: AppConfig) {
  config = c
}

function getConfig(): AppConfig {
  if (!config) {
    throw new Error('API client not initialized. Call initApiClient() first.')
  }
  return config
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getConfig().getToken()
  if (token) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

export const apiClient = {
  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${getConfig().serverEndpoint}${path}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.append(key, value)
        }
      })
    }
    const authHeaders = await getAuthHeaders()
    const response = await fetch(url.toString(), {
      headers: authHeaders
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    return response.json()
  },

  async post<T>(path: string, data?: unknown): Promise<T> {
    const authHeaders = await getAuthHeaders()
    const response = await fetch(`${getConfig().serverEndpoint}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: data ? JSON.stringify(data) : undefined
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    return response.json()
  },

  async put<T>(path: string, data?: unknown): Promise<T> {
    const authHeaders = await getAuthHeaders()
    const response = await fetch(`${getConfig().serverEndpoint}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: data ? JSON.stringify(data) : undefined
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    return response.json()
  },

  async delete<T>(path: string): Promise<T> {
    const authHeaders = await getAuthHeaders()
    const response = await fetch(`${getConfig().serverEndpoint}${path}`, {
      method: 'DELETE',
      headers: authHeaders
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    return response.json()
  }
}
