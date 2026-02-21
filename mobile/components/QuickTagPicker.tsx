import { useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import { useUpdateTag } from '@poucher/shared/api/hooks'
import {
  tagContainsBookmark,
  addBookmarkToTag,
  removeBookmarkFromTag,
} from '@poucher/shared/utils/tag-utils'
import type { Tag } from '@poucher/shared/api/types'
import { colors } from '../theme/colors'

interface QuickTagPickerProps {
  visible: boolean
  bookmarkId: string
  tags: Tag[]
  onClose: () => void
}

export function QuickTagPicker({
  visible,
  bookmarkId,
  tags,
  onClose,
}: QuickTagPickerProps) {
  const updateTag = useUpdateTag()

  const handleToggleTag = useCallback(
    (tag: Tag) => {
      const isAssigned = tagContainsBookmark(tag, bookmarkId)
      const newBookmarkID = isAssigned
        ? removeBookmarkFromTag(tag, bookmarkId)
        : addBookmarkToTag(tag, bookmarkId)

      updateTag.mutate({
        id: tag.ID,
        updates: { bookmarkID: newBookmarkID },
      })
    },
    [bookmarkId, updateTag]
  )

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <SafeAreaView>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Assign Tags</Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <FontAwesome6 name="xmark" size={18} color={colors.gray[500]} />
              </Pressable>
            </View>

            {/* Tag list */}
            <ScrollView style={styles.list} bounces={false}>
              {tags.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>
                    No tags yet. Create tags from the Bookmarks tab.
                  </Text>
                </View>
              ) : (
                tags.map((tag) => {
                  const isAssigned = tagContainsBookmark(tag, bookmarkId)
                  return (
                    <Pressable
                      key={tag.ID}
                      style={styles.tagRow}
                      onPress={() => handleToggleTag(tag)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isAssigned && styles.checkboxChecked,
                        ]}
                      >
                        {isAssigned && (
                          <FontAwesome6
                            name="check"
                            size={12}
                            color={colors.white}
                          />
                        )}
                      </View>
                      <Text style={styles.tagTitle}>{tag.title}</Text>
                      {updateTag.isPending && (
                        <ActivityIndicator
                          size="small"
                          color={colors.forest[500]}
                          style={styles.spinner}
                        />
                      )}
                    </Pressable>
                  )
                })
              )}
            </ScrollView>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  checkboxChecked: {
    backgroundColor: colors.forest[500],
    borderColor: colors.forest[500],
  },
  tagTitle: {
    fontSize: 16,
    color: colors.gray[900],
    flex: 1,
  },
  spinner: {
    marginLeft: 8,
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
})
