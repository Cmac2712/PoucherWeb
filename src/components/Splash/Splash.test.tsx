import { describe, it } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import { Splash } from './Splash'

describe('Splash', async () => {
  it('should render', () => {
    render(<Splash />)
    // LoginForm shows "Log In" button and "Sign up" link
    expect(screen.getByText('Log In')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
    expect(screen.getByText('Poucher.io')).toBeInTheDocument()
    expect(screen.getByText('All your stuff in one place.')).toBeInTheDocument()
  })
})
