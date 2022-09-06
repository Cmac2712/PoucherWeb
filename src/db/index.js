const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

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