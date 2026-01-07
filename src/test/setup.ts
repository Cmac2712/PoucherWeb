import '@testing-library/jest-dom'
import { server } from '../mocks/node'
import { db } from '../mocks/data/db'

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers and database after each test
afterEach(() => {
  server.resetHandlers()
  db.reset()
})

// Clean up after all tests
afterAll(() => server.close())
