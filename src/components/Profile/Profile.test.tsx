import { test } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import { Profile } from './Profile'
import { appState } from '../../test/testData'

test('Profile', async () => {
  render(<Profile user={appState.user} />)

  // Profile picture is displayed
  expect(screen.getByTestId('profile-picture').getAttribute('src')).toBe(
    appState.user.picture
  )

  // Profile picture has alt text
  expect(screen.getByTestId('profile-picture').getAttribute('alt')).toBe(
    appState.user.given_name
  )

  // Email is displayed
  expect(screen.getByTestId('email').innerHTML).toBe(appState.user.email)

  // Name is displayed
  expect(screen.getByTestId('given_name').innerHTML).toBe(
    appState.user.given_name
  )
})
