import { authHandlers } from './auth'
import { bookmarkHandlers } from './bookmarks'
import { tagHandlers } from './tags'
import { userHandlers } from './users'

export const handlers = [
  ...authHandlers,
  ...bookmarkHandlers,
  ...tagHandlers,
  ...userHandlers
]
