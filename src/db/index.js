const { PrismaClient } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid')

const prisma = new PrismaClient()

const getUser = async function (id) {
  return await prisma.user.findUnique({
    where: {
      id
    }
  })
}

exports.getUser = getUser

exports.createUser = async function ({ user: { id, email, name } }) {
  const user = await getUser(id)

  if (user) return user

  return await prisma.user.create({
    data: {
      id,
      email,
      name
    }
  })
}

exports.updateUser = async function ({ user: { id, name, email } }) {
  return await prisma.user.update({
    where: {
      id
    },
    data: {
      name,
      email
    }
  })
}

exports.createBookmark = async function (bookmark) {
  return await prisma.bookmark.create({
    data: bookmark
  })
}

exports.updateBookmark = async function (id, updates) {
  const bookmark = await prisma.bookmark.update({
    where: {
      id
    },
    data: {
      ...updates
    }
  })

  return bookmark
}

exports.deleteBookmark = async function (id) {
  const bookmark = await prisma.bookmark.delete({
    where: {
      id
    }
  })

  return bookmark
}

exports.getBookmarksCount = async function (authorID, title, description) {
  return await prisma.bookmark.count({
    where: {
      authorID
    },
    where: {
      authorID,
      OR: [
        {
          title: {
            contains: title,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: description,
            mode: 'insensitive'
          }
        }
      ]
    }
  })
}

exports.getBookmarksByAuthor = async function (id, skip, take) {
  const bookmarks = await prisma.bookmark.findMany({
    skip,
    take,
    where: {
      authorID: id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return bookmarks
}

exports.searchBookmarks = async function (
  id,
  skip,
  take,
  authorID,
  title,
  description
) {
  // This should be renamed to IDs instead of id
  if (id && id.length) {
    console.log('ids: ', id)
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        id: {
          in: JSON.parse(id)
        }
      }
    })

    return bookmarks
  }

  const searchBookmarks = await prisma.bookmark.findMany({
    skip,
    take,
    orderBy: {
      createdAt: 'desc'
    },
    where: {
      authorID,
      OR: [
        {
          title: {
            contains: title,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: description,
            mode: 'insensitive'
          }
        }
      ]
    }
  })

  return searchBookmarks
}

const createTag = async function ({ tag }) {
  const id = uuidv4()

  return await prisma.tags.create({
    data: {
      ID: id,
      ...tag
    }
  })
}

exports.createTag = createTag

const getTags = async function (authorID) {
  return await prisma.tags.findMany({
    where: {
      authorID
    }
  })
}

exports.getTags = getTags

const updateTag = async function ({ tag }) {
  return await prisma.tags.update({
    where: {
      ID: tag.ID
    },
    data: {
      title: tag.title,
      bookmarkID: tag.bookmarkID,
      authorID: tag.authorID
    }
  })
}

exports.updateTag = updateTag

const deleteTag = ({ tag }) => {
  return prisma.tags.delete({
    where: {
      ID: tag.ID
    }
  })
}

exports.deleteTag = deleteTag
