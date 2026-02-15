export interface UserPreferences {
  theme?: 'light' | 'dark'
  displayName?: string
}

export interface User {
  id: string
  email: string
  name: string
  preferences?: UserPreferences
}

export interface Bookmark {
  id: string
  title: string
  description: string
  url: string
  videoURL?: string
  authorID?: string
  screenshotURL?: string
  metadata?: Record<string, unknown>
  metadataStatus?: 'pending' | 'ready' | 'failed'
  metadataError?: string | null
  metadataUpdatedAt?: string | null
  createdAt?: string
}

export interface Tag {
  ID: string
  title: string
  authorID: string
  bookmarkID: string
}

export interface InitResponse {
  user: User
  tags: Tag[]
}

export interface BookmarksResponse {
  bookmarks: Bookmark[]
  count: number
}

export interface BookmarkSearchParams {
  authorID?: string
  title?: string
  description?: string
  offset?: number
  limit?: number
  ids?: string
}

export interface Note {
  id: string
  authorID?: string
  title: string
  content: string
  createdAt?: string
  updatedAt?: string
}

export interface NotesResponse {
  notes: Note[]
  count: number
}

export interface NoteSearchParams {
  authorID?: string
  title?: string
  offset?: number
  limit?: number
}
