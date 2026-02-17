# Notes Feature — Implementation Plan

## Overview
Add standalone Notes alongside Bookmarks. Notes appear mixed in the same grid, with a visual icon to differentiate them. Clicking "Add Note" opens a Tiptap WYSIWYG editor in a modal.

---

## 1. Backend

### 1a. Migration — `services/migrations/004_create_notes.sql`
- `CREATE TABLE notes` with columns: `id UUID PK`, `author_id UUID FK → users`, `title VARCHAR(500)`, `content TEXT` (stores Tiptap HTML), `created_at`, `updated_at`
- Indexes on `author_id`, `created_at`
- `updated_at` trigger (same pattern as bookmarks)

### 1b. Model — update `services/shared/db/models.py`
- Add `Note` class: id, author_id, title, content, timestamps
- Add `to_dict()` returning `{ id, authorID, title, content, createdAt, updatedAt }`
- Add `notes` relationship to `User` model

### 1c. Handler — `services/notes/handler.py`
- Full CRUD following the bookmarks handler pattern:
  - `GET /api/notes` — search/list with pagination (offset, limit, title filter), filtered by author_id
  - `POST /api/notes` — create note
  - `PUT /api/notes/{id}` — update note (title, content)
  - `DELETE /api/notes/{id}` — delete note
- Token validation, user ownership checks, `get_session()` context manager

---

## 2. Frontend — Types & API

### 2a. Types — update `src/api/types.ts`
- Add `Note` interface: `{ id, authorID, title, content, createdAt, updatedAt }`
- Add `NotesResponse`: `{ notes: Note[], count: number }`
- Add `NoteSearchParams`: `{ authorID, title?, offset?, limit? }`

### 2b. Hooks — update `src/api/hooks.ts`
- `useSearchNotes(params)` — React Query hook for GET /api/notes
- `useCreateNote()` — mutation for POST
- `useUpdateNote()` — mutation for PUT
- `useDeleteNote()` — mutation for DELETE
- Add `notes` query key to `queryKeys`

---

## 3. Frontend — State

### 3a. Page store — update `src/store/page-store.ts`
- Add `notes: Note[]`, `setNotes`, `notesCount: number`, `setNotesCount` to the existing store
- Notes share the same `offset`, `search`, and `perPage` as bookmarks so they paginate/filter together

---

## 4. Frontend — Components

### 4a. Install Tiptap
- `yarn add @tiptap/react @tiptap/starter-kit @tiptap/pm`

### 4b. `src/components/Notes/NotePreview.tsx`
- Card component styled like BookmarkPreview (same rounded card, hover effects, dark mode)
- Top-right corner: sticky note icon (FontAwesome `faNoteSticky`) to differentiate from bookmarks
- Shows title (line-clamped), content preview (stripped HTML, line-clamped)
- Hover actions: Edit (opens Tiptap editor modal), Delete (confirmation dialog)

### 4c. `src/components/Notes/NoteEditor.tsx`
- Tiptap WYSIWYG editor component used for both create and edit
- Basic toolbar: bold, italic, headings, bullet list, ordered list, code block
- Title input field above the editor
- Save / Cancel buttons
- On save: calls `useCreateNote` or `useUpdateNote` mutation, then closes modal

### 4d. `src/components/Notes/NoteSkeleton.tsx`
- Loading skeleton matching NotePreview layout (no image, just text placeholders)

### 4e. `src/components/Notes/index.ts`
- Barrel exports

### 4f. `src/components/CreateNote/CreateNote.tsx`
- "Add Note" button in the header (next to "Add Bookmark")
- On click: opens modal with `NoteEditor` in create mode

### 4g. Update `src/components/Bookmarks/BookmarkPreview.tsx`
- Add a bookmark icon (FontAwesome `faBookmark`) in the top-right corner to differentiate from notes

### 4h. Update `src/components/Bookmarks/Bookmarks.tsx`
- Fetch both bookmarks and notes
- Merge and sort by `createdAt` descending
- Render `BookmarkPreview` for bookmarks, `NotePreview` for notes in the same grid
- Update skeleton count if needed

### 4i. Update `src/components/AdminScreen/AdminScreen.tsx`
- Add `CreateNote` button in the header alongside `CreateBookmark`

---

## 5. File Summary

| # | File | Action |
|---|------|--------|
| 1 | `services/migrations/004_create_notes.sql` | Create |
| 2 | `services/shared/db/models.py` | Edit |
| 3 | `services/notes/__init__.py` | Create |
| 4 | `services/notes/handler.py` | Create |
| 5 | `src/api/types.ts` | Edit |
| 6 | `src/api/hooks.ts` | Edit |
| 7 | `src/store/page-store.ts` | Edit |
| 8 | `src/components/Notes/NotePreview.tsx` | Create |
| 9 | `src/components/Notes/NoteEditor.tsx` | Create |
| 10 | `src/components/Notes/NoteSkeleton.tsx` | Create |
| 11 | `src/components/Notes/index.ts` | Create |
| 12 | `src/components/CreateNote/CreateNote.tsx` | Create |
| 13 | `src/components/CreateNote/index.ts` | Create |
| 14 | `src/components/Bookmarks/BookmarkPreview.tsx` | Edit (add bookmark icon) |
| 15 | `src/components/Bookmarks/Bookmarks.tsx` | Edit (mixed grid) |
| 16 | `src/components/AdminScreen/AdminScreen.tsx` | Edit (add CreateNote) |
| 17 | `package.json` / `yarn.lock` | Updated by yarn add |

---

## 6. Implementation Order
1. Install Tiptap dependency
2. Backend: migration → model → handler
3. Frontend types & hooks
4. Page store updates
5. NoteEditor component (Tiptap)
6. NotePreview + NoteSkeleton components
7. CreateNote button
8. Update Bookmarks grid to mix in notes
9. Update BookmarkPreview with bookmark icon
10. Wire CreateNote into AdminScreen header
11. Run tests
