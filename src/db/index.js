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
      id: parseInt(id),
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
      id: parseInt(id),
    },
  })

  return bookmark;
}

exports.allBookmarks = async function() {
  const allBookmarks = await prisma.bookmark.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return allBookmarks;
} 