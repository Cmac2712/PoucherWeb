import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { FontAwesome6 } from '@expo/vector-icons'
import type { Bookmark, Tag } from '@poucher/shared/api/types'
import { getTagsForBookmark } from '@poucher/shared/utils/tag-utils'
import { colors } from '../theme/colors'

interface BookmarkCardProps {
  bookmark: Bookmark
  tags: Tag[]
  onEdit: (bookmark: Bookmark) => void
  onDelete: (id: string) => void
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export function BookmarkCard({ bookmark, tags, onEdit, onDelete }: BookmarkCardProps) {
  const bookmarkTags = getTagsForBookmark(tags, bookmark.id)

  const handlePress = async () => {
    if (bookmark.url) {
      await WebBrowser.openBrowserAsync(bookmark.url)
    }
  }

  const handleLongPress = () => {
    Alert.alert(bookmark.title || 'Bookmark', undefined, [
      { text: 'Edit', onPress: () => onEdit(bookmark) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Delete Bookmark',
            'Are you sure you want to delete this bookmark?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => onDelete(bookmark.id),
              },
            ]
          )
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  return (
    <Pressable
      style={styles.card}
      onPress={handlePress}
      onLongPress={handleLongPress}
    >
      <View style={styles.header}>
        <Text style={styles.domain} numberOfLines={1}>
          {getDomain(bookmark.url)}
        </Text>
        {bookmark.metadataStatus === 'pending' && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Loading...</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {bookmark.title || bookmark.url}
      </Text>

      {bookmark.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {bookmark.description}
        </Text>
      ) : null}

      {bookmarkTags.length > 0 && (
        <View style={styles.tags}>
          {bookmarkTags.map((tag) => (
            <View key={tag.ID} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag.title}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={() => onEdit(bookmark)}>
          <FontAwesome6 name="pen-to-square" size={14} color={colors.gray[400]} />
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Delete Bookmark',
              'Are you sure you want to delete this bookmark?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => onDelete(bookmark.id),
                },
              ]
            )
          }}
        >
          <FontAwesome6 name="trash-can" size={14} color={colors.red[500]} />
        </Pressable>
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
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  domain: {
    fontSize: 12,
    color: colors.gray[500],
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: colors.gray[100],
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pendingText: {
    fontSize: 10,
    color: colors.gray[500],
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    lineHeight: 22,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.gray[500],
    lineHeight: 20,
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: colors.forest[50],
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.forest[500],
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  actionButton: {
    padding: 4,
  },
})
