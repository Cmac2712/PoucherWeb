import { ScrollView, Pressable, Text, StyleSheet } from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import type { Tag } from '@poucher/shared/api/types'
import { getBookmarkCount } from '@poucher/shared/utils/tag-utils'
import { colors } from '../theme/colors'

interface TagFilterBarProps {
  tags: Tag[]
  selectedTag: string
  onSelectTag: (tagTitle: string) => void
  onManageTags?: () => void
}

export function TagFilterBar({ tags, selectedTag, onSelectTag, onManageTags }: TagFilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Pressable
        style={[styles.chip, selectedTag === 'All' && styles.chipActive]}
        onPress={() => onSelectTag('All')}
      >
        <Text style={[styles.chipText, selectedTag === 'All' && styles.chipTextActive]}>
          All
        </Text>
      </Pressable>

      {tags.map((tag) => {
        const isActive = selectedTag === tag.title
        const count = getBookmarkCount(tag)
        return (
          <Pressable
            key={tag.ID}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelectTag(tag.title)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {tag.title}
              {count > 0 ? ` (${count})` : ''}
            </Text>
          </Pressable>
        )
      })}

      {onManageTags && (
        <Pressable style={styles.manageChip} onPress={onManageTags}>
          <FontAwesome6 name="gear" size={12} color={colors.gray[500]} />
          <Text style={styles.manageText}>Manage</Text>
        </Pressable>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  chipActive: {
    backgroundColor: colors.forest[500],
    borderColor: colors.forest[500],
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[700],
  },
  chipTextActive: {
    color: colors.white,
  },
  manageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  manageText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[500],
  },
})
