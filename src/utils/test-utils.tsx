import { UserProvider } from '../contexts/user-context'
import { StrictMode, ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, RenderOptions } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { vi } from 'vitest'
import { Auth0Provider } from '@auth0/auth0-react'
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

vi.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }: Props) => children,
  withAuthenticationRequired: (component: unknown) => component,
  useAuth0: () => {
    return {
      isLoading: false,
      user: appState.user,
      isAuthenticated: true,
      loginWithRedirect: vi.fn()
    }
  }
}))

const AllTheProviders = ({ children }: Props) => {
  const queryClient = createTestQueryClient()

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Auth0Provider
          domain={'http://localhost:3000/'}
          clientId={'321'}
          redirectUri={'https://localhost:3000/'}
        >
          <UserProvider>{children}</UserProvider>
        </Auth0Provider>
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
