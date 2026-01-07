import { http, HttpResponse } from 'msw'
import { db } from '../data/db'
import type { Bookmark, BookmarksResponse } from '../../api/types'

export const bookmarkHandlers = [
  // GET /api/bookmarks - Search/list bookmarks with pagination
  http.get('*/api/bookmarks', ({ request }) => {
    const url = new URL(request.url)
    const authorID = url.searchParams.get('authorID') || ''
    const title = url.searchParams.get('title') || undefined
    const description = url.searchParams.get('description') || undefined
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)
    const limit = parseInt(url.searchParams.get('limit') || '15', 10)
    const ids = url.searchParams.get('ids') || undefined

    const result = db.searchBookmarks(
      authorID,
      { title, description, ids },
      offset,
      limit
    )

    const response: BookmarksResponse = result
    return HttpResponse.json(response)
  }),

  // POST /api/bookmarks - Create bookmark
  http.post<never, Partial<Bookmark>>(
    '*/api/bookmarks',
    async ({ request }) => {
      const body = await request.json()

      const newBookmark: Bookmark = {
        id: crypto.randomUUID(),
        title: body.title || '',
        description: body.description || '',
        url: body.url || '',
        videoURL: body.videoURL,
        authorID: body.authorID,
        screenshotURL: body.screenshotURL,
        createdAt: Date.now().toString()
      }

      db.bookmarks.push(newBookmark)
      return HttpResponse.json({ bookmark: newBookmark }, { status: 201 })
    }
  ),

  // PUT /api/bookmarks/:id - Update bookmark
  http.put<{ id: string }, Partial<Bookmark>>(
    '*/api/bookmarks/:id',
    async ({ params, request }) => {
      const { id } = params
      const updates = await request.json()

      const bookmarkIndex = db.bookmarks.findIndex((b) => b.id === id)
      if (bookmarkIndex === -1) {
        return HttpResponse.json(
          { error: 'Bookmark not found' },
          { status: 404 }
        )
      }

      db.bookmarks[bookmarkIndex] = {
        ...db.bookmarks[bookmarkIndex],
        ...updates
      }

      return HttpResponse.json({ bookmark: db.bookmarks[bookmarkIndex] })
    }
  ),

  // DELETE /api/bookmarks/:id - Delete bookmark
  http.delete<{ id: string }>('*/api/bookmarks/:id', ({ params }) => {
    const { id } = params

    const bookmarkIndex = db.bookmarks.findIndex((b) => b.id === id)
    if (bookmarkIndex === -1) {
      return HttpResponse.json({ error: 'Bookmark not found' }, { status: 404 })
    }

    const [deleted] = db.bookmarks.splice(bookmarkIndex, 1)
    return HttpResponse.json({ bookmark: deleted })
  })
]
