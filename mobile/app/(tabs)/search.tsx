import { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import { useSearchBookmarks, useSearchNotes } from '@poucher/shared/api/hooks'
import type { Bookmark, Note } from '@poucher/shared/api/types'
import { useUser } from '../../contexts/user-context'
import { BookmarkCard } from '../../components/BookmarkCard'
import { NoteCard } from '../../components/NoteCard'
import { colors } from '../../theme/colors'

type SearchResult =
  | { type: 'bookmark'; data: Bookmark }
  | { type: 'note'; data: Note }

// Simple debounce hook
function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useState(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  })

  // Use effect-like pattern with useState
  if (debouncedValue !== value) {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    // Cleanup handled by React
  }

  return debouncedValue
}

export default function SearchScreen() {
  const { data: userData } = useUser()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Manual debounce with timeout ref
  const handleQueryChange = useCallback((text: string) => {
    setQuery(text)
    // Simple debounce using setTimeout
    const timer = setTimeout(() => setDebouncedQuery(text), 300)
    return () => clearTimeout(timer)
  }, [])

  const { data: bookmarkData, isLoading: bookmarksLoading } = useSearchBookmarks({
    authorID: userData?.user.id,
    title: debouncedQuery,
    description: debouncedQuery,
    limit: 20,
  })

  const { data: noteData, isLoading: notesLoading } = useSearchNotes({
    authorID: userData?.user.id,
    title: debouncedQuery,
    limit: 20,
  })

  const isLoading = bookmarksLoading || notesLoading
  const hasQuery = debouncedQuery.trim().length > 0

  const results = useMemo<SearchResult[]>(() => {
    if (!hasQuery) return []

    const items: SearchResult[] = []

    if (bookmarkData?.bookmarks) {
      bookmarkData.bookmarks.forEach((b) =>
        items.push({ type: 'bookmark', data: b })
      )
    }

    if (noteData?.notes) {
      noteData.notes.forEach((n) =>
        items.push({ type: 'note', data: n })
      )
    }

    return items
  }, [bookmarkData, noteData, hasQuery])

  const renderItem = useCallback(
    ({ item }: { item: SearchResult }) => {
      if (item.type === 'bookmark') {
        return (
          <BookmarkCard
            bookmark={item.data}
            tags={userData?.tags ?? []}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        )
      }
      return (
        <NoteCard
          note={item.data}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      )
    },
    [userData?.tags]
  )

  return (
    <View style={styles.container}>
      {/* Search input */}
      <View style={styles.searchBar}>
        <FontAwesome6 name="magnifying-glass" size={16} color={colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bookmarks and notes..."
          placeholderTextColor={colors.gray[400]}
          value={query}
          onChangeText={(text) => {
            setQuery(text)
            setTimeout(() => setDebouncedQuery(text), 300)
          }}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery('')
              setDebouncedQuery('')
            }}
          >
            <FontAwesome6 name="xmark" size={16} color={colors.gray[400]} />
          </Pressable>
        )}
      </View>

      {/* Results */}
      {isLoading && hasQuery ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.forest[500]} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.data.id}`}
          renderItem={renderItem}
          contentContainerStyle={results.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={
            hasQuery ? (
              <View style={styles.empty}>
                <FontAwesome6 name="magnifying-glass" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyTitle}>No results</Text>
                <Text style={styles.emptySubtitle}>
                  Try a different search term
                </Text>
              </View>
            ) : (
              <View style={styles.empty}>
                <FontAwesome6 name="magnifying-glass" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyTitle}>Search</Text>
                <Text style={styles.emptySubtitle}>
                  Find your bookmarks and notes
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray[200],
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[900],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 8,
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
})
