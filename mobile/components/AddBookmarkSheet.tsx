import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { useCreateBookmark } from '@poucher/shared/api/hooks'
import { useUser } from '../contexts/user-context'
import { colors } from '../theme/colors'

interface AddBookmarkSheetProps {
  visible: boolean
  onClose: () => void
}

export function AddBookmarkSheet({ visible, onClose }: AddBookmarkSheetProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const { data } = useUser()
  const createBookmark = useCreateBookmark()

  useEffect(() => {
    if (visible) {
      // Auto-paste from clipboard when sheet opens
      Clipboard.getStringAsync().then((text) => {
        if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
          setUrl(text)
        }
      })
    } else {
      setUrl('')
      setError('')
    }
  }, [visible])

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    let finalUrl = url.trim()
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`
    }

    setError('')

    try {
      await createBookmark.mutateAsync({
        url: finalUrl,
        title: finalUrl,
        description: '',
        authorID: data?.user.id,
      })
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create bookmark'
      setError(message)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>Add Bookmark</Text>

          <Text style={styles.label}>URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com"
            placeholderTextColor={colors.gray[400]}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            autoFocus
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttons}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.submitButton, createBookmark.isPending && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={createBookmark.isPending}
            >
              {createBookmark.isPending ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.submitText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[300],
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.gray[900],
    marginBottom: 16,
  },
  error: {
    color: colors.red[500],
    fontSize: 14,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[700],
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.forest[500],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
})
