import { CognitoUserPool, CognitoUserSession } from 'amazon-cognito-identity-js'

const API_BASE = import.meta.env.VITE_SERVER_ENDPOINT

const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || ''
})

async function getAuthToken(): Promise<string | null> {
  const cognitoUser = userPool.getCurrentUser()

  if (!cognitoUser) {
    return null
  }

  return new Promise((resolve) => {
    cognitoUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session?.isValid()) {
          resolve(null)
          return
        }
        resolve(session.getAccessToken().getJwtToken())
      }
    )
  })
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken()
  if (token) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

export const apiClient = {
  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${API_BASE}${path}`)
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
    const response = await fetch(`${API_BASE}${path}`, {
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
    const response = await fetch(`${API_BASE}${path}`, {
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
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: authHeaders
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    return response.json()
  }
}
