import { useState } from 'react'
import { useCognitoAuth } from '../../contexts/auth-context'

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

  if (mode === 'confirm') {
    return (
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Confirm Your Email</h2>
          <p className="text-sm opacity-70">
            We sent a confirmation code to {email}
          </p>

          {error && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleConfirm}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirmation Code</span>
              </label>
              <input
                type="text"
                placeholder="Enter code"
                className="input input-bordered"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                required
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <button
              className="link link-hover text-sm"
              onClick={() => setMode('login')}
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card w-96 bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="alert alert-error text-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={mode === 'login' ? handleLogin : handleSignUp}>
          {mode === 'signup' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="input input-bordered"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              className="input input-bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="********"
              className="input input-bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="form-control mt-6">
            <button
              type="submit"
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading
                ? mode === 'login'
                  ? 'Logging in...'
                  : 'Signing up...'
                : mode === 'login'
                  ? 'Log In'
                  : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="divider">OR</div>

        <div className="text-center">
          {mode === 'login' ? (
            <p className="text-sm">
              Don't have an account?{' '}
              <button
                className="link link-primary"
                onClick={() => {
                  setMode('signup')
                  setError(null)
                }}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-sm">
              Already have an account?{' '}
              <button
                className="link link-primary"
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
