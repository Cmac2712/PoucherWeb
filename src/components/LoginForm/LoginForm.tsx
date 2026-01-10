import { useState } from 'react'
import { useCognitoAuth } from '../../contexts/auth-context'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEnvelope,
  faLock,
  faUser,
  faEye,
  faEyeSlash,
  faKey,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons'

type AuthMode = 'login' | 'signup' | 'confirm'

export const LoginForm = () => {
  const { login, signUp, confirmSignUp } = useCognitoAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmCode, setConfirmCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await signUp(email, password, name)
      setMode('confirm')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await confirmSignUp(email, confirmCode)
      setMode('login')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Confirmation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError(null)
  }

  if (mode === 'confirm') {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest-100 mb-4">
              <FontAwesomeIcon icon={faEnvelope} className="text-forest-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Check Your Email</h2>
            <p className="text-foreground-muted text-sm mt-2">
              We sent a confirmation code to<br />
              <span className="text-forest-600">{email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">
                Confirmation Code
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faKey}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
                />
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>

          <button
            className="flex items-center justify-center gap-2 w-full mt-6 text-sm text-foreground-muted hover:text-foreground transition-colors"
            onClick={() => switchMode('login')}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-foreground-muted text-sm mt-1">
            {mode === 'login'
              ? 'Sign in to access your bookmarks'
              : 'Start organizing your bookmarks today'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">
                Name
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
                />
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">
              Email
            </label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
              />
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">
              Password
            </label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faLock}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
              />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-xs text-foreground-muted mt-1">
                Minimum 8 characters
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading
              ? mode === 'login'
                ? 'Signing in...'
                : 'Creating account...'
              : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-foreground-muted">or</span>
          </div>
        </div>

        <p className="text-center text-sm text-foreground-muted">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                className="text-forest-600 hover:text-forest-700 font-medium transition-colors"
                onClick={() => switchMode('signup')}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                className="text-forest-600 hover:text-forest-700 font-medium transition-colors"
                onClick={() => switchMode('login')}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
