import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useCreateNote, useUpdateNote } from '../../api/hooks'
import { useModalStore } from '../../store/modal-store'
import { useCognitoAuth } from '../../contexts/auth-context'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBold,
  faItalic,
  faStrikethrough,
  faCode,
  faListUl,
  faListOl,
  faQuoteLeft,
  faMinus,
} from '@fortawesome/free-solid-svg-icons'
import type { Note } from '../../api/types'

interface Props {
  note?: Note
}

export const NoteEditor = ({ note }: Props) => {
  const [title, setTitle] = useState(note?.title || '')
  const { user } = useCognitoAuth()
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const closeModal = useModalStore((s) => s.closeModal)

  const isEditing = !!note

  const editor = useEditor({
    extensions: [StarterKit],
    content: note?.content || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-3 focus:outline-none',
      },
    },
  })

  const handleSave = () => {
    const content = editor?.getHTML() || ''

    if (isEditing && note) {
      updateNote.mutate({
        id: note.id,
        updates: { title, content },
      })
    } else {
      createNote.mutate({
        title,
        content,
        authorID: user?.sub,
      })
    }
    closeModal()
  }

  const isPending = createNote.isPending || updateNote.isPending

  if (!editor) return null

  return (
    <div className="space-y-4 w-full max-w-2xl">
      <h2 className="text-lg font-semibold text-foreground dark:text-gray-100">
        {isEditing ? 'Edit Note' : 'New Note'}
      </h2>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        autoFocus
      />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border border-gray-200 dark:border-gray-700 rounded-t-md p-1.5 bg-gray-50 dark:bg-gray-800">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          icon={faBold}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          icon={faItalic}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          icon={faStrikethrough}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          icon={faCode}
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          label="H2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          label="H3"
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          icon={faListUl}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          icon={faListOl}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          icon={faQuoteLeft}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          label="<>"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={faMinus}
        />
      </div>

      {/* Editor */}
      <div className="border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-900 overflow-auto max-h-[400px]">
        <EditorContent editor={editor} />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

function ToolbarButton({
  onClick,
  active,
  icon,
  label,
}: {
  onClick: () => void
  active?: boolean
  icon?: typeof faBold
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm transition-colors ${
        active
          ? 'bg-forest-100 dark:bg-forest-900 text-forest-700 dark:text-forest-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon ? <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" /> : label}
    </button>
  )
}
