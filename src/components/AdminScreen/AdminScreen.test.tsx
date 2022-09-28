import { describe, it } from 'vitest'
import { render } from '../../utils/test-utils'
import { AdminScreen } from './AdminScreen'

describe('AdminScreen', async () => {
  it('should render', () => render(<AdminScreen />))
})
