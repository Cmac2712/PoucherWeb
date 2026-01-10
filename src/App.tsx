import './app.css'
import { CognitoAuthProvider } from './contexts/auth-context'
import { AdminScreen } from './components/AdminScreen/AdminScreen'
import { StrictMode } from 'react'
import ReactGA from 'react-ga4'

ReactGA.initialize('G-7W2Y583PM9')
ReactGA.send('pageview')

function App() {
  return (
    <StrictMode>
      <CognitoAuthProvider>
        <AdminScreen />
      </CognitoAuthProvider>
    </StrictMode>
  )
}

export default App
