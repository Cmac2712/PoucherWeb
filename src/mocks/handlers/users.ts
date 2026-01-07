import { http, HttpResponse } from 'msw'
import { db } from '../data/db'
import type { User } from '../../api/types'

export const userHandlers = [
  // PUT /api/users/:id - Update user
  http.put<{ id: string }, Partial<User>>(
    '*/api/users/:id',
    async ({ params, request }) => {
      const { id } = params
      const updates = await request.json()

      const userIndex = db.users.findIndex((u) => u.id === id)
      if (userIndex === -1) {
        return HttpResponse.json({ error: 'User not found' }, { status: 404 })
      }

      db.users[userIndex] = { ...db.users[userIndex], ...updates }
      return HttpResponse.json({ user: db.users[userIndex] })
    }
  )
]
