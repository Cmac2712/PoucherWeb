import { UserProvider } from '../contexts/user-context'
import { CognitoAuthProvider } from '../contexts/auth-context'
import { StrictMode, ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, RenderOptions } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { vi } from 'vitest'
import { appState } from '../test/testData'

// Create a new QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  })

interface Props {
  children: ReactElement
}

// Mock amazon-cognito-identity-js
vi.mock('amazon-cognito-identity-js', () => ({
  CognitoUserPool: vi.fn().mockImplementation(() => ({
    getCurrentUser: () => null
  })),
  CognitoUser: vi.fn(),
  AuthenticationDetails: vi.fn(),
  CognitoUserAttribute: vi.fn()
}))

// Mock the auth context to provide test user
vi.mock('../contexts/auth-context', () => ({
  CognitoAuthProvider: ({ children }: Props) => children,
  useCognitoAuth: () => ({
    user: appState.user,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    signUp: vi.fn(),
    confirmSignUp: vi.fn(),
    getAccessToken: vi.fn().mockResolvedValue('mock-token')
  })
}))

const AllTheProviders = ({ children }: Props) => {
  const queryClient = createTestQueryClient()

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <CognitoAuthProvider>
          <UserProvider>{children}</UserProvider>
        </CognitoAuthProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
