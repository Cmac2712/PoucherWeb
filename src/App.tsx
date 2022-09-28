import './app.css'
import { Auth0Provider } from '@auth0/auth0-react'
import { AdminScreen } from './components/AdminScreen/AdminScreen'
import { StrictMode } from 'react'

function App() {
  return (
    <StrictMode>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        redirectUri={window.location.origin}
      >
        <AdminScreen />
      </Auth0Provider>
    </StrictMode>
  )
}

export default App
