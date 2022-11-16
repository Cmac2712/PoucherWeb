import './app.css'
import { Auth0Provider } from '@auth0/auth0-react'
import { AdminScreen } from './components/AdminScreen/AdminScreen'
import { StrictMode } from 'react'
import { usePageStore } from './store/page-store'
import ReactGA from 'react-ga4'

ReactGA.initialize('G-7W2Y583PM9')
ReactGA.send('pageview')

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
