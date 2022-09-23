const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const getUser = async function(id) {
  return await prisma.user.findUnique({
    where: {
      id
    }
  })
}

exports.getUser = getUser

exports.createUser = async function({ user: { id, email, name }}) {

  const user = await getUser(id)

  if (user) return user

  return await prisma.user.create({
    data: {
      id,
      email,
      name,
    }
  })
}

exports.updateUser = async function({ user: { id, name, email } }) {
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

exports.createBookmark = async function(bookmark) {
  return await prisma.bookmark.create({
    data: bookmark
  })
}

exports.updateBookmark = async function(id, updates) {

  const bookmark = await prisma.bookmark.update({
    where: {
      id
    }, 
    data: {
      ...updates
    }
  })

  return bookmark;
}

exports.deleteBookmark = async function(id) {
  const bookmark = await prisma.bookmark.delete({
    where: {
      id
    },
  })

  return bookmark;
}

exports.getBookmarksCount = async function(authorID, title, description) {
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

exports.getBookmarksByAuthor = async function(id, skip, take) {
  const bookmarks = await prisma.bookmark.findMany({
    skip,
    take,
    where: {
      authorID: id,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return bookmarks;
}

exports.searchBookmarks = async function(skip, take, authorID, title, description) {
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

  return searchBookmarks;
} 

const getTags = async function(authorID) {
  return await prisma.tags.findMany({
    where: {
      authorID
    }
  })
}

exports.getTags = getTags

const updateTag = async function({ tag }) {
  return await prisma.tags.update({
    where: {
      ID: tag.id 
    },
    data: {
      title: tag.title,
      bookmarkID: tag.bookmarkID,
      authorID: tag.authorID
    }
  })
}

exports.updateTag = updateTag

// exports.updateBookmark = async function(id, updates) {

//   const bookmark = await prisma.bookmark.update({
//     where: {
//       id
//     }, 
//     data: {
//       ...updates
//     }
//   })

//   return bookmark;
// }