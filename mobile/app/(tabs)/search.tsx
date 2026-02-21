import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import {
  useSearchBookmarks,
  useSearchNotes,
  useDeleteBookmark,
  useDeleteNote,
  useUpdateNote,
} from '@poucher/shared/api/hooks'
import type { Bookmark, Note } from '@poucher/shared/api/types'
import { useUser } from '../../contexts/user-context'
import { useAppTheme } from '../../theme/ThemeContext'
import { BookmarkCard } from '../../components/BookmarkCard'
import { NoteCard } from '../../components/NoteCard'
import { EditBookmarkSheet } from '../../components/EditBookmarkSheet'
import { MarkdownEditor } from '../../components/MarkdownEditor'
import { colors } from '../../theme/colors'

type SearchResult =
  | { type: 'bookmark'; data: Bookmark }
  | { type: 'note'; data: Note }

export default function SearchScreen() {
  const { data: userData } = useUser()
  const { theme } = useAppTheme()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Bookmark editing
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
  const deleteBookmark = useDeleteBookmark()

  // Note editing
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const deleteNote = useDeleteNote()
  const updateNote = useUpdateNote()

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(text)
    }, 300)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleClear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setQuery('')
    setDebouncedQuery('')
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

  const handleDeleteBookmark = useCallback(
    (id: string) => {
      deleteBookmark.mutate(id)
    },
    [deleteBookmark]
  )

  const handleEditNote = useCallback((note: Note) => {
    setEditingNote(note)
    setNoteTitle(note.title)
    setNoteContent(note.content)
  }, [])

  const handleDeleteNote = useCallback(
    (id: string) => {
      deleteNote.mutate(id)
    },
    [deleteNote]
  )

  const handleSaveNote = async () => {
    if (!editingNote || !noteTitle.trim()) return
    await updateNote.mutateAsync({
      id: editingNote.id,
      updates: { title: noteTitle.trim(), content: noteContent },
    })
    setEditingNote(null)
  }

  const isSavingNote = updateNote.isPending

  const renderItem = useCallback(
    ({ item }: { item: SearchResult }) => {
      if (item.type === 'bookmark') {
        return (
          <BookmarkCard
            bookmark={item.data}
            tags={userData?.tags ?? []}
            onEdit={setEditingBookmark}
            onDelete={handleDeleteBookmark}
          />
        )
      }
      return (
        <NoteCard
          note={item.data}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />
      )
    },
    [userData?.tags, handleDeleteBookmark, handleEditNote, handleDeleteNote]
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Search input */}
      <View style={[styles.searchBar, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <FontAwesome6 name="magnifying-glass" size={16} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search bookmarks and notes..."
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={handleQueryChange}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={handleClear}>
            <FontAwesome6 name="xmark" size={16} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Results */}
      {isLoading && hasQuery ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.data.id}`}
          renderItem={renderItem}
          contentContainerStyle={results.length === 0 ? styles.emptyContainer : styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            hasQuery ? (
              <View style={styles.empty}>
                <FontAwesome6 name="magnifying-glass" size={48} color={theme.border} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No results</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Try a different search term
                </Text>
              </View>
            ) : (
              <View style={styles.empty}>
                <FontAwesome6 name="magnifying-glass" size={48} color={theme.border} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Search</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Find your bookmarks and notes
                </Text>
              </View>
            )
          }
        />
      )}

      {/* Edit Bookmark Sheet */}
      <EditBookmarkSheet
        visible={!!editingBookmark}
        bookmark={editingBookmark}
        onClose={() => setEditingBookmark(null)}
      />

      {/* Edit Note Modal */}
      <Modal
        visible={!!editingNote}
        animationType="slide"
        onRequestClose={() => setEditingNote(null)}
      >
        <SafeAreaView style={[styles.editorContainer, { backgroundColor: theme.background }]}>
          <KeyboardAvoidingView
            style={styles.editorContent}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={[styles.editorHeader, { borderBottomColor: theme.border }]}>
              <Pressable onPress={() => setEditingNote(null)}>
                <Text style={[styles.editorCancel, { color: theme.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Text style={[styles.editorTitleText, { color: theme.text }]}>Edit Note</Text>
              <Pressable
                onPress={handleSaveNote}
                disabled={isSavingNote || !noteTitle.trim()}
              >
                {isSavingNote ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Text
                    style={[
                      styles.editorSave,
                      { color: theme.primary },
                      !noteTitle.trim() && styles.editorSaveDisabled,
                    ]}
                  >
                    Save
                  </Text>
                )}
              </Pressable>
            </View>
            <TextInput
              style={[styles.titleInput, { color: theme.text, borderBottomColor: theme.border }]}
              placeholder="Note title"
              placeholderTextColor={theme.textSecondary}
              value={noteTitle}
              onChangeText={setNoteTitle}
            />
            <View style={styles.editorBody}>
              <MarkdownEditor
                value={noteContent}
                onChangeText={setNoteContent}
                placeholder="Start writing..."
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  editorContainer: {
    flex: 1,
  },
  editorContent: {
    flex: 1,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  editorCancel: {
    fontSize: 16,
  },
  editorTitleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  editorSave: {
    fontSize: 16,
    fontWeight: '600',
  },
  editorSaveDisabled: {
    opacity: 0.4,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  editorBody: {
    flex: 1,
    padding: 16,
  },
})
