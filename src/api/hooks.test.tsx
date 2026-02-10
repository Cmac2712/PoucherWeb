import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './client'
import { useSearchBookmarks } from './hooks'
import type { BookmarksResponse } from './types'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const pendingResponse: BookmarksResponse = {
  bookmarks: [
    {
      id: 'bookmark-1',
      title: 'Pending Bookmark',
      description: 'Loading metadata',
      url: 'https://example.com',
      metadataStatus: 'pending'
    }
  ],
  count: 1
}

const readyResponse: BookmarksResponse = {
  bookmarks: [
    {
      id: 'bookmark-1',
      title: 'Ready Bookmark',
      description: 'Metadata loaded',
      url: 'https://example.com',
      metadataStatus: 'ready'
    }
  ],
  count: 1
}

describe('useSearchBookmarks polling', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('polls every 2 seconds when metadata is pending', async () => {
    const getSpy = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValueOnce(pendingResponse)
      .mockResolvedValueOnce(readyResponse)

    renderHook(
      () =>
        useSearchBookmarks({
          authorID: 'user-1'
        }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(getSpy).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(getSpy).toHaveBeenCalledTimes(2), {
      timeout: 3500
    })
  })

  it('does not poll when metadata is already ready', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(readyResponse)

    renderHook(
      () =>
        useSearchBookmarks({
          authorID: 'user-1'
        }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(getSpy).toHaveBeenCalledTimes(1))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2400))
    })
    expect(getSpy).toHaveBeenCalledTimes(1)
  })

  it('stops polling after metadata transitions from pending to ready', async () => {
    const getSpy = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValueOnce(pendingResponse)
      .mockResolvedValue(readyResponse)

    renderHook(
      () =>
        useSearchBookmarks({
          authorID: 'user-1'
        }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(getSpy).toHaveBeenCalledTimes(2), {
      timeout: 3500
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2400))
    })
    expect(getSpy).toHaveBeenCalledTimes(2)
  })
})
