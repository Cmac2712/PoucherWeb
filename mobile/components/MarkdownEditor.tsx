import { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native'
import { colors } from '../theme/colors'

interface MarkdownEditorProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

interface ToolbarAction {
  label: string
  prefix: string
  suffix: string
}

const toolbarActions: ToolbarAction[] = [
  { label: 'B', prefix: '**', suffix: '**' },
  { label: 'I', prefix: '_', suffix: '_' },
  { label: 'H2', prefix: '## ', suffix: '' },
  { label: 'H3', prefix: '### ', suffix: '' },
  { label: '-', prefix: '- ', suffix: '' },
  { label: '1.', prefix: '1. ', suffix: '' },
  { label: '`', prefix: '`', suffix: '`' },
  { label: '[]', prefix: '[', suffix: '](url)' },
]

export function MarkdownEditor({ value, onChangeText, placeholder }: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [selection, setSelection] = useState({ start: 0, end: 0 })
  const inputRef = useRef<TextInput>(null)

  const handleSelectionChange = (
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    setSelection(e.nativeEvent.selection)
  }

  const insertMarkdown = (action: ToolbarAction) => {
    const before = value.slice(0, selection.start)
    const selected = value.slice(selection.start, selection.end)
    const after = value.slice(selection.end)
    const inserted = `${action.prefix}${selected || 'text'}${action.suffix}`
    onChangeText(`${before}${inserted}${after}`)
  }

  const renderPreview = () => {
    // Simple markdown preview — renders basic formatting
    const lines = value.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('### ')) {
        return (
          <Text key={i} style={styles.previewH3}>
            {line.slice(4)}
          </Text>
        )
      }
      if (line.startsWith('## ')) {
        return (
          <Text key={i} style={styles.previewH2}>
            {line.slice(3)}
          </Text>
        )
      }
      if (line.startsWith('# ')) {
        return (
          <Text key={i} style={styles.previewH1}>
            {line.slice(2)}
          </Text>
        )
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <Text key={i} style={styles.previewText}>
            {'\u2022 '}{line.slice(2)}
          </Text>
        )
      }
      if (line.trim() === '') {
        return <Text key={i}>{'\n'}</Text>
      }
      // Render inline formatting
      const formatted = line
        .replace(/\*\*(.+?)\*\*/g, '$1') // Bold markers removed for Text (styled separately in production)
        .replace(/_(.+?)_/g, '$1')
        .replace(/`(.+?)`/g, '$1')
      return (
        <Text key={i} style={styles.previewText}>
          {formatted}
        </Text>
      )
    })
  }

  return (
    <View style={styles.container}>
      {/* Mode toggle */}
      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.modeButton, mode === 'edit' && styles.modeButtonActive]}
          onPress={() => setMode('edit')}
        >
          <Text
            style={[styles.modeText, mode === 'edit' && styles.modeTextActive]}
          >
            Edit
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === 'preview' && styles.modeButtonActive]}
          onPress={() => setMode('preview')}
        >
          <Text
            style={[styles.modeText, mode === 'preview' && styles.modeTextActive]}
          >
            Preview
          </Text>
        </Pressable>
      </View>

      {mode === 'edit' ? (
        <>
          {/* Toolbar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbar}
          >
            {toolbarActions.map((action) => (
              <Pressable
                key={action.label}
                style={styles.toolbarButton}
                onPress={() => insertMarkdown(action)}
              >
                <Text style={styles.toolbarButtonText}>{action.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            onSelectionChange={handleSelectionChange}
            placeholder={placeholder || 'Write your note...'}
            placeholderTextColor={colors.gray[400]}
            multiline
            textAlignVertical="top"
          />
        </>
      ) : (
        <ScrollView style={styles.preview}>{renderPreview()}</ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: 2,
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.white,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[500],
  },
  modeTextActive: {
    color: colors.gray[900],
  },
  toolbar: {
    gap: 6,
    paddingBottom: 8,
  },
  toolbarButton: {
    backgroundColor: colors.gray[100],
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 36,
    alignItems: 'center',
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    fontFamily: 'monospace',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[900],
    lineHeight: 24,
    fontFamily: 'monospace',
    padding: 0,
  },
  preview: {
    flex: 1,
  },
  previewH1: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
    marginVertical: 8,
  },
  previewH2: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    marginVertical: 6,
  },
  previewH3: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginVertical: 4,
  },
  previewText: {
    fontSize: 16,
    color: colors.gray[800],
    lineHeight: 24,
  },
})
