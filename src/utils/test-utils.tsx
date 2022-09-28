import { UserProvider, useUser } from '../contexts/user-context'
import { PageProvider } from '../contexts/page-context'
import { ModalProvider } from '../contexts/modal-context'
import { StrictMode } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
//import { Auth0Provider } from '@auth0/auth0-react'
import { mocks, appState } from '../test/testData'
import { vi } from 'vitest'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'

interface Props {
  children: ReactElement
}

vi.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }) => children,
  withAuthenticationRequired: (component, _) => component,
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
  return (
    <StrictMode>
      <MockedProvider mocks={mocks}>
        <Auth0Provider
          domain={'http://localhost:3000/'}
          clientId={'321'}
          redirectUri={'https://localhost:3000/'}
        >
          <UserProvider>
            <PageProvider>
              <ModalProvider>{children}</ModalProvider>
            </PageProvider>
          </UserProvider>
        </Auth0Provider>
      </MockedProvider>
    </StrictMode>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
