import { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import { useSearchBookmarks, useDeleteBookmark } from '@poucher/shared/api/hooks'
import { parseBookmarkIds } from '@poucher/shared/utils/tag-utils'
import type { Bookmark } from '@poucher/shared/api/types'
import { useUser } from '../../contexts/user-context'
import { BookmarkCard } from '../../components/BookmarkCard'
import { AddBookmarkSheet } from '../../components/AddBookmarkSheet'
import { EditBookmarkSheet } from '../../components/EditBookmarkSheet'
import { TagFilterBar } from '../../components/TagFilterBar'
import { colors } from '../../theme/colors'

const PAGE_SIZE = 15

export default function BookmarksScreen() {
  const { data: userData, loading: userLoading } = useUser()
  const [offset, setOffset] = useState(0)
  const [selectedTag, setSelectedTag] = useState('All')
  const [addSheetVisible, setAddSheetVisible] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)

  const deleteBookmark = useDeleteBookmark()

  // Compute bookmark IDs for the selected tag
  const bookmarkIDs = useMemo(() => {
    if (selectedTag === 'All' || !userData?.tags) return undefined
    const tag = userData.tags.find((t) => t.title === selectedTag)
    if (!tag) return undefined
    const ids = parseBookmarkIds(tag.bookmarkID).list
    return ids.length > 0 ? ids.join(',') : '___empty___'
  }, [selectedTag, userData?.tags])

  const { data, isLoading, refetch } = useSearchBookmarks({
    authorID: userData?.user.id,
    offset,
    limit: PAGE_SIZE,
    ids: bookmarkIDs,
  })

  const bookmarks = data?.bookmarks ?? []
  const totalCount = data?.count ?? 0
  const hasMore = offset + PAGE_SIZE < totalCount

  const handleRefresh = useCallback(() => {
    setOffset(0)
    refetch()
  }, [refetch])

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setOffset((prev) => prev + PAGE_SIZE)
    }
  }, [hasMore, isLoading])

  const handleTagSelect = useCallback((tagTitle: string) => {
    setSelectedTag(tagTitle)
    setOffset(0)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      deleteBookmark.mutate(id)
    },
    [deleteBookmark]
  )

  if (userLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.forest[500]} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {userData?.tags && userData.tags.length > 0 && (
        <TagFilterBar
          tags={userData.tags}
          selectedTag={selectedTag}
          onSelectTag={handleTagSelect}
        />
      )}

      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookmarkCard
            bookmark={item}
            tags={userData?.tags ?? []}
            onEdit={setEditingBookmark}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={bookmarks.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && offset === 0}
            onRefresh={handleRefresh}
            tintColor={colors.forest[500]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore ? (
            <ActivityIndicator
              style={styles.footer}
              color={colors.forest[500]}
            />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <FontAwesome6 name="bookmark" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No bookmarks yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the + button to save your first bookmark
              </Text>
            </View>
          ) : null
        }
      />

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => setAddSheetVisible(true)}
      >
        <FontAwesome6 name="plus" size={22} color={colors.white} />
      </Pressable>

      <AddBookmarkSheet
        visible={addSheetVisible}
        onClose={() => setAddSheetVisible(false)}
      />

      <EditBookmarkSheet
        visible={!!editingBookmark}
        bookmark={editingBookmark}
        onClose={() => setEditingBookmark(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[700],
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.forest[500],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
})
