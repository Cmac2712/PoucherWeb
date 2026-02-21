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
import { useRouter } from 'expo-router'
import { useSearchBookmarks, useDeleteBookmark } from '@poucher/shared/api/hooks'
import { parseBookmarkIds } from '@poucher/shared/utils/tag-utils'
import type { Bookmark } from '@poucher/shared/api/types'
import { useUser } from '../../../contexts/user-context'
import { useAppTheme } from '../../../theme/ThemeContext'
import { BookmarkCard } from '../../../components/BookmarkCard'
import { AddBookmarkSheet } from '../../../components/AddBookmarkSheet'
import { EditBookmarkSheet } from '../../../components/EditBookmarkSheet'
import { TagFilterBar } from '../../../components/TagFilterBar'
import { QuickTagPicker } from '../../../components/QuickTagPicker'
import { colors } from '../../../theme/colors'

const PAGE_SIZE = 15

export default function BookmarksScreen() {
  const { data: userData, loading: userLoading } = useUser()
  const { theme } = useAppTheme()
  const router = useRouter()
  const [offset, setOffset] = useState(0)
  const [selectedTag, setSelectedTag] = useState('All')
  const [addSheetVisible, setAddSheetVisible] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
  const [taggingBookmark, setTaggingBookmark] = useState<Bookmark | null>(null)

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

  const handleManageTags = useCallback(() => {
    router.push('/bookmarks/tags')
  }, [router])

  if (userLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.surface }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {userData?.tags && userData.tags.length > 0 && (
        <TagFilterBar
          tags={userData.tags}
          selectedTag={selectedTag}
          onSelectTag={handleTagSelect}
          onManageTags={handleManageTags}
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
            onTagPress={setTaggingBookmark}
          />
        )}
        contentContainerStyle={bookmarks.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && offset === 0}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore ? (
            <ActivityIndicator
              style={styles.footer}
              color={theme.primary}
            />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <FontAwesome6 name="bookmark" size={48} color={theme.border} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No bookmarks yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Tap the + button to save your first bookmark
              </Text>
            </View>
          ) : null
        }
      />

      {/* FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setAddSheetVisible(true)}
      >
        <FontAwesome6 name="plus" size={22} color={theme.primaryText} />
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

      {taggingBookmark && (
        <QuickTagPicker
          visible={!!taggingBookmark}
          bookmarkId={taggingBookmark.id}
          tags={userData?.tags ?? []}
          onClose={() => setTaggingBookmark(null)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
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
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
})
