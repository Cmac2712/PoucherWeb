import { describe, expect, it } from 'vitest'
import type { Tag } from '../api/types'
import {
  parseBookmarkIds,
  serializeBookmarkIds,
  tagContainsBookmark,
  getTagsForBookmark,
  addBookmarkToTag,
  removeBookmarkFromTag,
  getBookmarkCount
} from './tag-utils'

const makeTag = (overrides: Partial<Tag> = {}): Tag => ({
  ID: 'tag-1',
  title: 'Test Tag',
  authorID: 'user-1',
  bookmarkID: '{"list":["bm-1","bm-2"]}',
  ...overrides
})

describe('parseBookmarkIds', () => {
  it('parses valid JSON with a list', () => {
    const result = parseBookmarkIds('{"list":["a","b"]}')
    expect(result).toEqual({ list: ['a', 'b'] })
  })

  it('returns empty list for malformed JSON', () => {
    expect(parseBookmarkIds('not json')).toEqual({ list: [] })
  })

  it('returns empty list for empty string', () => {
    expect(parseBookmarkIds('')).toEqual({ list: [] })
  })

  it('returns empty list when list property is missing', () => {
    expect(parseBookmarkIds('{"other":"value"}')).toEqual({ list: [] })
  })

  it('returns empty list when list is not an array', () => {
    expect(parseBookmarkIds('{"list":"not-array"}')).toEqual({ list: [] })
  })
})

describe('serializeBookmarkIds', () => {
  it('serializes a TagBookmarkList', () => {
    expect(serializeBookmarkIds({ list: ['a', 'b'] })).toBe('{"list":["a","b"]}')
  })

  it('serializes an empty list', () => {
    expect(serializeBookmarkIds({ list: [] })).toBe('{"list":[]}')
  })
})

describe('tagContainsBookmark', () => {
  it('returns true when bookmark is in the tag', () => {
    const tag = makeTag()
    expect(tagContainsBookmark(tag, 'bm-1')).toBe(true)
  })

  it('returns false when bookmark is not in the tag', () => {
    const tag = makeTag()
    expect(tagContainsBookmark(tag, 'bm-99')).toBe(false)
  })
})

describe('getTagsForBookmark', () => {
  it('returns tags that contain the bookmark', () => {
    const tags = [
      makeTag({ ID: 'tag-1', bookmarkID: '{"list":["bm-1"]}' }),
      makeTag({ ID: 'tag-2', bookmarkID: '{"list":["bm-2"]}' }),
      makeTag({ ID: 'tag-3', bookmarkID: '{"list":["bm-1","bm-3"]}' })
    ]
    const result = getTagsForBookmark(tags, 'bm-1')
    expect(result.map((t) => t.ID)).toEqual(['tag-1', 'tag-3'])
  })

  it('returns empty array when no tags match', () => {
    const tags = [makeTag({ bookmarkID: '{"list":["bm-2"]}' })]
    expect(getTagsForBookmark(tags, 'bm-99')).toEqual([])
  })
})

describe('addBookmarkToTag', () => {
  it('adds a bookmark to the tag', () => {
    const tag = makeTag({ bookmarkID: '{"list":["bm-1"]}' })
    const result = addBookmarkToTag(tag, 'bm-2')
    expect(JSON.parse(result)).toEqual({ list: ['bm-1', 'bm-2'] })
  })

  it('does not add a duplicate bookmark', () => {
    const tag = makeTag({ bookmarkID: '{"list":["bm-1"]}' })
    const result = addBookmarkToTag(tag, 'bm-1')
    expect(result).toBe(tag.bookmarkID)
  })

  it('adds to an empty list', () => {
    const tag = makeTag({ bookmarkID: '{"list":[]}' })
    const result = addBookmarkToTag(tag, 'bm-1')
    expect(JSON.parse(result)).toEqual({ list: ['bm-1'] })
  })
})

describe('removeBookmarkFromTag', () => {
  it('removes a bookmark from the tag', () => {
    const tag = makeTag({ bookmarkID: '{"list":["bm-1","bm-2"]}' })
    const result = removeBookmarkFromTag(tag, 'bm-1')
    expect(JSON.parse(result)).toEqual({ list: ['bm-2'] })
  })

  it('returns unchanged list when bookmark is not present', () => {
    const tag = makeTag({ bookmarkID: '{"list":["bm-1"]}' })
    const result = removeBookmarkFromTag(tag, 'bm-99')
    expect(JSON.parse(result)).toEqual({ list: ['bm-1'] })
  })
})

describe('getBookmarkCount', () => {
  it('returns the number of bookmarks in a tag', () => {
    const tag = makeTag({ bookmarkID: '{"list":["a","b","c"]}' })
    expect(getBookmarkCount(tag)).toBe(3)
  })

  it('returns 0 for an empty list', () => {
    const tag = makeTag({ bookmarkID: '{"list":[]}' })
    expect(getBookmarkCount(tag)).toBe(0)
  })

  it('returns 0 for malformed JSON', () => {
    const tag = makeTag({ bookmarkID: 'bad' })
    expect(getBookmarkCount(tag)).toBe(0)
  })
})
