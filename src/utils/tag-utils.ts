import type { Tag } from '../api/types'

/** The shape stored inside tag.bookmarkID */
export interface TagBookmarkList {
  list: string[]
}

/** Safely parse tag.bookmarkID. Returns empty list on failure. */
export function parseBookmarkIds(bookmarkID: string): TagBookmarkList {
  try {
    const parsed = JSON.parse(bookmarkID)
    if (parsed && Array.isArray(parsed.list)) {
      return parsed as TagBookmarkList
    }
    return { list: [] }
  } catch {
    return { list: [] }
  }
}

/** Serialize a TagBookmarkList back to the JSON string format */
export function serializeBookmarkIds(data: TagBookmarkList): string {
  return JSON.stringify(data)
}

/** Check if a bookmark ID exists in a tag's list */
export function tagContainsBookmark(tag: Tag, bookmarkId: string): boolean {
  return parseBookmarkIds(tag.bookmarkID).list.includes(bookmarkId)
}

/** Get all tags that contain a given bookmark ID */
export function getTagsForBookmark(tags: Tag[], bookmarkId: string): Tag[] {
  return tags.filter((tag) => tagContainsBookmark(tag, bookmarkId))
}

/** Add a bookmark ID to a tag's list. No-op if already present. */
export function addBookmarkToTag(tag: Tag, bookmarkId: string): string {
  const data = parseBookmarkIds(tag.bookmarkID)
  if (data.list.includes(bookmarkId)) {
    return tag.bookmarkID
  }
  data.list.push(bookmarkId)
  return serializeBookmarkIds(data)
}

/** Remove a bookmark ID from a tag's list. */
export function removeBookmarkFromTag(tag: Tag, bookmarkId: string): string {
  const data = parseBookmarkIds(tag.bookmarkID)
  data.list = data.list.filter((id) => id !== bookmarkId)
  return serializeBookmarkIds(data)
}

/** Count bookmarks in a tag */
export function getBookmarkCount(tag: Tag): number {
  return parseBookmarkIds(tag.bookmarkID).list.length
}
