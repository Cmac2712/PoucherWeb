const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

exports.createBookmark = async function(bookmark) {
  return await prisma.bookmark.create({
    data: bookmark
  })
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
  const allBookmarks = await prisma.bookmark.findMany()

  return allBookmarks;
} 