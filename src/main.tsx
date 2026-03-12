import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CognitoUserPool, CognitoUserSession } from 'amazon-cognito-identity-js'
import { initApiClient } from '@poucher/shared/api/client'
import { setThemeApplier } from '@poucher/shared/store/theme-store'
import { setPreferencesThemeApplier } from '@poucher/shared/store/preferences-store'
import App from './App'
import './index.css'

// Web-specific theme applier (DOM-based)
function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

setThemeApplier(applyTheme)
setPreferencesThemeApplier(applyTheme)

// Web-specific Cognito token retrieval
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

initApiClient({
  serverEndpoint: import.meta.env.VITE_SERVER_ENDPOINT,
  getToken: getAuthToken
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1
    }
  }
})

async function enableMocking() {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
    const { worker } = await import('./mocks/browser')
    return worker.start({ onUnhandledRequest: 'bypass' })
  }
  return Promise.resolve()
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  )
})
