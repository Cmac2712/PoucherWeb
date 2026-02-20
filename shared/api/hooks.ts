import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import type {
  User,
  Bookmark,
  Tag,
  Note,
  InitResponse,
  BookmarksResponse,
  BookmarkSearchParams,
  NotesResponse,
  NoteSearchParams
} from './types'

// Query Keys
export const queryKeys = {
  userInit: (id: string) => ['userInit', id] as const,
  bookmarks: (params: BookmarkSearchParams) => ['bookmarks', params] as const,
  tags: (authorID: string) => ['tags', authorID] as const,
  notes: (params: NoteSearchParams) => ['notes', params] as const
}

// User initialization (replaces CREATE_USER query)
export function useUserInit(userData: {
  id?: string
  email?: string
  name?: string
}) {
  return useQuery({
    queryKey: queryKeys.userInit(userData.id || ''),
    queryFn: () => apiClient.post<InitResponse>('api/auth/init', userData),
    enabled: !!userData.id,
    staleTime: 5 * 60 * 1000
  })
}

// Search bookmarks (replaces SEARCH_BOOKMARKS query)
export function useSearchBookmarks(params: BookmarkSearchParams) {
  return useQuery({
    queryKey: queryKeys.bookmarks(params),
    queryFn: () =>
      apiClient.get<BookmarksResponse>('api/bookmarks', {
        authorID: params.authorID || '',
        title: params.title || '',
        description: params.description || '',
        offset: String(params.offset || 0),
        limit: String(params.limit || 15),
        ...(params.ids && { ids: params.ids })
      }),
    enabled: !!params.authorID,
    refetchInterval: (query) =>
      query.state.data?.bookmarks?.some(
        (bookmark) => bookmark.metadataStatus === 'pending'
      )
        ? 2000
        : false,
    refetchIntervalInBackground: false
  })
}

// Create Bookmark Mutation
export function useCreateBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookmark: Partial<Bookmark>) =>
      apiClient.post<{ bookmark: Bookmark }>('api/bookmarks', bookmark),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    }
  })
}

// Update Bookmark Mutation
export function useUpdateBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Bookmark> }) =>
      apiClient.put<{ bookmark: Bookmark }>(`api/bookmarks/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    }
  })
}

// Delete Bookmark Mutation
export function useDeleteBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ bookmark: Bookmark }>(`api/bookmarks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    }
  })
}

// Create Tag Mutation
export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tag: Partial<Tag>) =>
      apiClient.post<{ tag: Tag }>('api/tags', tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['userInit'] })
    }
  })
}

// Update Tag Mutation
export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Tag> }) =>
      apiClient.put<{ tag: Tag }>(`api/tags/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['userInit'] })
    }
  })
}

// Delete Tag Mutation
export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ tag: Tag }>(`api/tags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['userInit'] })
    }
  })
}

// Search Notes
export function useSearchNotes(params: NoteSearchParams) {
  return useQuery({
    queryKey: queryKeys.notes(params),
    queryFn: () =>
      apiClient.get<NotesResponse>('api/notes', {
        authorID: params.authorID || '',
        title: params.title || '',
        offset: String(params.offset || 0),
        limit: String(params.limit || 100),
      }),
    enabled: !!params.authorID,
  })
}

// Create Note Mutation
export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (note: Partial<Note>) =>
      apiClient.post<{ note: Note }>('api/notes', note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })
}

// Update Note Mutation
export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Note> }) =>
      apiClient.put<{ note: Note }>(`api/notes/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })
}

// Delete Note Mutation
export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ note: Note }>(`api/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })
}

// Update User Mutation
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
      apiClient.put<{ user: User }>(`api/users/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInit'] })
    }
  })
}
