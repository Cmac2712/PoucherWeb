import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import type { Note } from '@poucher/shared/api/types'
import { colors } from '../theme/colors'

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
}

function stripHtmlAndMarkdown(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[#*_~`>\-]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const preview = stripHtmlAndMarkdown(note.content)

  const handleLongPress = () => {
    Alert.alert(note.title || 'Note', undefined, [
      { text: 'Edit', onPress: () => onEdit(note) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Delete Note', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => onDelete(note.id),
            },
          ])
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  return (
    <Pressable
      style={styles.card}
      onPress={() => onEdit(note)}
      onLongPress={handleLongPress}
    >
      <View style={styles.header}>
        <FontAwesome6 name="note-sticky" size={14} color={colors.forest[500]} />
        <Text style={styles.title} numberOfLines={1}>
          {note.title || 'Untitled'}
        </Text>
      </View>

      {preview ? (
        <Text style={styles.preview} numberOfLines={2}>
          {preview}
        </Text>
      ) : null}

      <View style={styles.footer}>
        {note.updatedAt ? (
          <Text style={styles.date}>
            {new Date(note.updatedAt).toLocaleDateString()}
          </Text>
        ) : null}
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={() => onEdit(note)}>
            <FontAwesome6 name="pen-to-square" size={14} color={colors.gray[400]} />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              Alert.alert('Delete Note', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => onDelete(note.id),
                },
              ])
            }}
          >
            <FontAwesome6 name="trash-can" size={14} color={colors.red[500]} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    flex: 1,
  },
  preview: {
    fontSize: 14,
    color: colors.gray[500],
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  date: {
    fontSize: 12,
    color: colors.gray[400],
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
})
