import type { User, Bookmark, Tag } from '../../api/types'
import { mockUserResponse, mockBookmarksResponse } from '../../test/testData'

// Initial data from existing test data
const initialUser: User = mockUserResponse.user
const initialTags: Tag[] = mockUserResponse.tags
const initialBookmarks: Bookmark[] = mockBookmarksResponse.bookmarks

// Mutable in-memory database
export const db = {
  users: [initialUser] as User[],
  bookmarks: [...initialBookmarks] as Bookmark[],
  tags: [...initialTags] as Tag[],

  // Reset to initial state (useful between tests)
  reset() {
    this.users = [initialUser]
    this.bookmarks = [...initialBookmarks]
    this.tags = [...initialTags]
  },

  // User helpers
  findUser(id: string) {
    return this.users.find((u) => u.id === id)
  },

  // Bookmark helpers
  findBookmark(id: string) {
    return this.bookmarks.find((b) => b.id === id)
  },

  searchBookmarks(
    authorID: string,
    filters: { title?: string; description?: string; ids?: string },
    offset = 0,
    limit = 15
  ) {
    let filtered = this.bookmarks.filter((b) => b.authorID === authorID)

    if (filters.title) {
      filtered = filtered.filter((b) =>
        b.title.toLowerCase().includes(filters.title!.toLowerCase())
      )
    }

    if (filters.description) {
      filtered = filtered.filter((b) =>
        b.description.toLowerCase().includes(filters.description!.toLowerCase())
      )
    }

    if (filters.ids) {
      const idList = filters.ids.split(',')
      filtered = filtered.filter((b) => idList.includes(b.id))
    }

    return {
      bookmarks: filtered.slice(offset, offset + limit),
      count: filtered.length
    }
  },

  // Tag helpers
  findTag(id: string) {
    return this.tags.find((t) => t.ID === id)
  },

  getTagsByAuthor(authorID: string) {
    return this.tags.filter((t) => t.authorID === authorID)
  }
}
