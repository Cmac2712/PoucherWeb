// LoginButton is deprecated - use LoginForm instead
// Kept for backwards compatibility but redirects to login form

import { useState } from 'react'
import { LoginForm } from '../LoginForm'

export const LoginButton = () => {
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="relative">
          <button
            className="absolute -top-2 -right-2 btn btn-circle btn-sm"
            onClick={() => setShowForm(false)}
          >
            ✕
          </button>
          <LoginForm />
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        className="btn btn-outline mr-2 normal-case"
        onClick={() => setShowForm(true)}
      >
        Sign Up
      </button>
      <button
        className="btn btn-primary normal-case"
        onClick={() => setShowForm(true)}
      >
        Log In
      </Button>
    </>
  )
}
