import '@testing-library/jest-dom'
import { initApiClient } from '@poucher/shared/api/client'
import { server } from '../mocks/node'
import { db } from '../mocks/data/db'

// Initialize shared API client for tests
initApiClient({
  serverEndpoint: 'http://localhost/',
  getToken: async () => 'mock-token'
})

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers and database after each test
afterEach(() => {
  server.resetHandlers()
  db.reset()
})

// Clean up after all tests
afterAll(() => server.close())
