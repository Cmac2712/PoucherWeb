import { http, HttpResponse } from 'msw'
import { db } from '../data/db'
import type { Tag } from '../../api/types'

export const tagHandlers = [
  // POST /api/tags - Create tag
  http.post<never, Partial<Tag>>('*/api/tags', async ({ request }) => {
    const body = await request.json()

    const newTag: Tag = {
      ID: crypto.randomUUID(),
      title: body.title || '',
      authorID: body.authorID || '',
      bookmarkID: body.bookmarkID || '{"list":[]}'
    }

    db.tags.push(newTag)
    return HttpResponse.json({ tag: newTag }, { status: 201 })
  }),

  // PUT /api/tags/:id - Update tag
  http.put<{ id: string }, Partial<Tag>>(
    '*/api/tags/:id',
    async ({ params, request }) => {
      const { id } = params
      const updates = await request.json()

      const tagIndex = db.tags.findIndex((t) => t.ID === id)
      if (tagIndex === -1) {
        return HttpResponse.json({ error: 'Tag not found' }, { status: 404 })
      }

      db.tags[tagIndex] = { ...db.tags[tagIndex], ...updates }
      return HttpResponse.json({ tag: db.tags[tagIndex] })
    }
  ),

  // DELETE /api/tags/:id - Delete tag
  http.delete<{ id: string }>('*/api/tags/:id', ({ params }) => {
    const { id } = params

    const tagIndex = db.tags.findIndex((t) => t.ID === id)
    if (tagIndex === -1) {
      return HttpResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    const [deleted] = db.tags.splice(tagIndex, 1)
    return HttpResponse.json({ tag: deleted })
  })
]
