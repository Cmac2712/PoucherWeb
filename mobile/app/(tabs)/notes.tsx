import { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import {
  useSearchNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from '@poucher/shared/api/hooks'
import type { Note } from '@poucher/shared/api/types'
import { useUser } from '../../contexts/user-context'
import { useAppTheme } from '../../theme/ThemeContext'
import { NoteCard } from '../../components/NoteCard'
import { MarkdownEditor } from '../../components/MarkdownEditor'
import { colors } from '../../theme/colors'

export default function NotesScreen() {
  const { data: userData, loading: userLoading } = useUser()
  const { theme } = useAppTheme()
  const [editorVisible, setEditorVisible] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')

  const deleteNote = useDeleteNote()
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()

  const { data, isLoading, refetch } = useSearchNotes({
    authorID: userData?.user.id,
    limit: 100,
  })

  const notes = data?.notes ?? []

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const openNewNote = useCallback(() => {
    setEditingNote(null)
    setNoteTitle('')
    setNoteContent('')
    setEditorVisible(true)
  }, [])

  const openEditNote = useCallback((note: Note) => {
    setEditingNote(note)
    setNoteTitle(note.title)
    setNoteContent(note.content)
    setEditorVisible(true)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      deleteNote.mutate(id)
    },
    [deleteNote]
  )

  const handleSave = async () => {
    if (!noteTitle.trim()) return

    if (editingNote) {
      await updateNote.mutateAsync({
        id: editingNote.id,
        updates: { title: noteTitle.trim(), content: noteContent },
      })
    } else {
      await createNote.mutateAsync({
        title: noteTitle.trim(),
        content: noteContent,
        authorID: userData?.user.id,
      })
    }
    setEditorVisible(false)
  }

  const isSaving = createNote.isPending || updateNote.isPending

  if (userLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.surface }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard note={item} onEdit={openEditNote} onDelete={handleDelete} />
        )}
        contentContainerStyle={notes.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <FontAwesome6 name="note-sticky" size={48} color={theme.border} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No notes yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Tap the + button to create your first note
              </Text>
            </View>
          ) : null
        }
      />

      {/* FAB */}
      <Pressable style={[styles.fab, { backgroundColor: theme.primary }]} onPress={openNewNote}>
        <FontAwesome6 name="plus" size={22} color={theme.primaryText} />
      </Pressable>

      {/* Note Editor Modal */}
      <Modal visible={editorVisible} animationType="slide" onRequestClose={() => setEditorVisible(false)}>
        <SafeAreaView style={[styles.editorContainer, { backgroundColor: theme.background }]}>
          <KeyboardAvoidingView
            style={styles.editorContent}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Editor Header */}
            <View style={[styles.editorHeader, { borderBottomColor: theme.border }]}>
              <Pressable onPress={() => setEditorVisible(false)}>
                <Text style={[styles.editorCancel, { color: theme.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Text style={[styles.editorTitle, { color: theme.text }]}>
                {editingNote ? 'Edit Note' : 'New Note'}
              </Text>
              <Pressable
                onPress={handleSave}
                disabled={isSaving || !noteTitle.trim()}
              >
                {isSaving ? (
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

            {/* Title input */}
            <TextInput
              style={[styles.titleInput, { color: theme.text, borderBottomColor: theme.border }]}
              placeholder="Note title"
              placeholderTextColor={theme.textSecondary}
              value={noteTitle}
              onChangeText={setNoteTitle}
              autoFocus={!editingNote}
            />

            {/* Markdown Editor */}
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
  editorTitle: {
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
