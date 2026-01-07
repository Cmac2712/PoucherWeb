import { http, HttpResponse } from 'msw'
import { db } from '../data/db'
import type { InitResponse } from '../../api/types'

export const authHandlers = [
  // POST /api/auth/init - Initialize user session
  http.post<never, { id: string; email: string; name: string }>(
    '*/api/auth/init',
    async ({ request }) => {
      const body = await request.json()

      // Find or create user
      let user = db.findUser(body.id)
      if (!user) {
        user = { id: body.id, email: body.email, name: body.name }
        db.users.push(user)
      }

      // Get user's tags
      const tags = db.getTagsByAuthor(body.id)

      const response: InitResponse = { user, tags }
      return HttpResponse.json(response)
    }
  )
]
