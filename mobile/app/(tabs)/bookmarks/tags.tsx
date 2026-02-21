import { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import { useCreateTag, useUpdateTag, useDeleteTag } from '@poucher/shared/api/hooks'
import { getBookmarkCount } from '@poucher/shared/utils/tag-utils'
import type { Tag } from '@poucher/shared/api/types'
import { useUser } from '../../../contexts/user-context'
import { useAppTheme } from '../../../theme/ThemeContext'
import { colors } from '../../../theme/colors'

export default function TagsScreen() {
  const { data: userData } = useUser()
  const { theme } = useAppTheme()
  const tags = userData?.tags ?? []

  const [newTagName, setNewTagName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const editInputRef = useRef<TextInput>(null)

  const createTag = useCreateTag()
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()

  const handleCreateTag = useCallback(() => {
    const title = newTagName.trim()
    if (!title || !userData?.user.id) return

    createTag.mutate(
      {
        title,
        authorID: userData.user.id,
        bookmarkID: JSON.stringify({ list: [] }),
      },
      {
        onSuccess: () => setNewTagName(''),
      }
    )
  }, [newTagName, userData?.user.id, createTag])

  const handleStartEdit = useCallback((tag: Tag) => {
    setEditingId(tag.ID)
    setEditingTitle(tag.title)
    setTimeout(() => editInputRef.current?.focus(), 50)
  }, [])

  const handleCommitEdit = useCallback(() => {
    const title = editingTitle.trim()
    if (!editingId || !title) {
      setEditingId(null)
      return
    }

    updateTag.mutate(
      { id: editingId, updates: { title } },
      {
        onSuccess: () => setEditingId(null),
        onError: () => setEditingId(null),
      }
    )
  }, [editingId, editingTitle, updateTag])

  const handleDelete = useCallback(
    (tag: Tag) => {
      Alert.alert(
        'Delete Tag',
        `Are you sure you want to delete "${tag.title}"? This will not delete the bookmarks in this tag.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteTag.mutate(tag.ID),
          },
        ]
      )
    },
    [deleteTag]
  )

  const renderTag = useCallback(
    ({ item }: { item: Tag }) => {
      const isEditing = editingId === item.ID
      const count = getBookmarkCount(item)

      return (
        <View style={styles.tagRow}>
          <View style={styles.tagDot} />
          <View style={styles.tagInfo}>
            {isEditing ? (
              <TextInput
                ref={editInputRef}
                style={styles.editInput}
                value={editingTitle}
                onChangeText={setEditingTitle}
                onSubmitEditing={handleCommitEdit}
                onBlur={handleCommitEdit}
                returnKeyType="done"
                autoFocus
              />
            ) : (
              <>
                <Text style={styles.tagTitle}>{item.title}</Text>
                <Text style={styles.tagCount}>
                  {count} {count === 1 ? 'bookmark' : 'bookmarks'}
                </Text>
              </>
            )}
          </View>
          <View style={styles.tagActions}>
            {!isEditing && (
              <>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleStartEdit(item)}
                  hitSlop={8}
                >
                  <FontAwesome6 name="pen" size={14} color={colors.gray[500]} />
                </Pressable>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleDelete(item)}
                  hitSlop={8}
                >
                  <FontAwesome6 name="trash-can" size={14} color={colors.red[500]} />
                </Pressable>
              </>
            )}
          </View>
        </View>
      )
    },
    [editingId, editingTitle, handleCommitEdit, handleStartEdit, handleDelete]
  )

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      {/* Add tag input */}
      <View style={[styles.addRow, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TextInput
          style={[styles.addInput, { color: theme.text, borderColor: theme.inputBorder, backgroundColor: theme.inputBackground }]}
          placeholder="New tag name..."
          placeholderTextColor={theme.textSecondary}
          value={newTagName}
          onChangeText={setNewTagName}
          onSubmitEditing={handleCreateTag}
          returnKeyType="done"
        />
        <Pressable
          style={[styles.addButton, { backgroundColor: theme.primary }, !newTagName.trim() && styles.addButtonDisabled]}
          onPress={handleCreateTag}
          disabled={!newTagName.trim() || createTag.isPending}
        >
          {createTag.isPending ? (
            <ActivityIndicator size="small" color={theme.primaryText} />
          ) : (
            <FontAwesome6 name="plus" size={16} color={theme.primaryText} />
          )}
        </Pressable>
      </View>

      {/* Tag list */}
      <FlatList
        data={tags}
        keyExtractor={(item) => item.ID}
        renderItem={renderTag}
        contentContainerStyle={tags.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <FontAwesome6 name="tags" size={48} color={theme.border} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No tags yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Create a tag above to organize your bookmarks
            </Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  addRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  addInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.forest[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
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
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  tagDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.forest[500],
    marginRight: 12,
  },
  tagInfo: {
    flex: 1,
  },
  tagTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[900],
  },
  tagCount: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 2,
  },
  editInput: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[900],
    borderBottomWidth: 1,
    borderBottomColor: colors.forest[500],
    paddingVertical: 2,
  },
  tagActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 6,
  },
})
