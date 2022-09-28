import { test } from 'vitest'
import { render, screen, waitFor } from '../../utils/test-utils'
import { Tags } from './Tags'

test('Tags', async () => {
  render(<Tags />)

  await waitFor(() => screen.getByTestId('tags-container'))

  //screen.debug()
  //expect(screen.getByTestId('tags-container'))
})
