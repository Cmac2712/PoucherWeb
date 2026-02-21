# Poucher Mobile App — Implementation Plan

## Overview

React Native (Expo) mobile app with feature parity to the PoucherWeb frontend, targeting iOS and Android. Lives in a monorepo alongside the existing web app with shared code.

---

## Decisions Summary

| Decision | Choice |
|----------|--------|
| Platforms | iOS + Android |
| Framework | Expo (managed workflow) |
| Repo structure | Monorepo (`/mobile` directory) |
| Navigation | Bottom tabs |
| Notes editor | Markdown editor with preview |
| App store accounts | To be set up |

### Mobile-specific features (v1)
- Share sheet integration (save URLs from other apps)
- Push notifications (metadata ready)
- Offline support (cached bookmarks/notes, background sync)

---

## Assumptions

1. **Same backend** — the existing Lambda + PostgreSQL API is reused as-is. No backend changes needed for core features.
2. **Same auth** — Cognito auth via `amazon-cognito-identity-js` works in React Native (it does, it's platform-agnostic).
3. **No biometric auth** in v1 — was not selected, can add later with `expo-local-authentication`.
4. **Expo SDK 52+** — latest stable, using the new architecture (Fabric).
5. **EAS Build** — Expo Application Services for building and submitting to app stores.
6. **No screenshot service on mobile** — bookmarks still get metadata extracted server-side via SQS workers.
7. **Tag-bookmark relationship** — the existing `bookmarkID` JSON field on tags works the same way. Filtering by tag is client-side using the IDs list.
8. **Google Analytics** — will use the same GA4 tracking ID via `expo-analytics` or similar.
9. **Dark mode** — follows device system preference by default, with manual override synced to backend preferences (same as web).
10. **No tablet-specific layouts** in v1 — phone-first, tablets get the phone layout scaled up.

---

## Phase 1: Project Setup & Shared Code

### 1.1 Monorepo Structure

```
PoucherWeb/
├── src/                    # Web app (existing)
├── mobile/                 # React Native app (new)
│   ├── app/                # Expo Router screens
│   ├── components/         # Mobile-specific components
│   ├── assets/             # App icons, splash screen
│   ├── app.json            # Expo config
│   ├── package.json
│   ├── tsconfig.json
│   └── eas.json            # EAS Build config
├── shared/                 # Shared code (new, extracted)
│   ├── api/
│   │   ├── client.ts       # API client (adapted for both platforms)
│   │   ├── hooks.ts        # React Query hooks
│   │   └── types.ts        # TypeScript interfaces
│   ├── store/
│   │   ├── page-store.ts
│   │   ├── modal-store.ts
│   │   ├── theme-store.ts
│   │   └── preferences-store.ts
│   └── utils/
│       └── tag-utils.ts
├── package.json            # Root workspace config
└── ...
```

### 1.2 Tasks

- [ ] Set up Yarn/npm workspaces in root `package.json`
- [ ] Create Expo app via `npx create-expo-app@latest mobile`
- [ ] Extract shared code from `src/api/`, `src/store/`, `src/utils/` into `shared/`
- [ ] Update web app imports to use `shared/`
- [ ] Configure TypeScript path aliases for both web and mobile
- [ ] Adapt `shared/api/client.ts` to work without Vite's `import.meta.env` (use a config/env abstraction)
- [ ] Add `react-native` and `expo` to the workspace

### 1.3 Shared Dependencies

These libraries work on both web and React Native:
- `@tanstack/react-query` — data fetching
- `zustand` — state management
- `amazon-cognito-identity-js` — Cognito auth
- `uuid` — ID generation

---

## Phase 2: Authentication

### 2.1 Cognito Auth in React Native

The `amazon-cognito-identity-js` package works in React Native with `AsyncStorage` as the storage backend (instead of `localStorage`).

### 2.2 Tasks

- [ ] Install `@react-native-async-storage/async-storage`
- [ ] Create mobile auth context wrapping Cognito with AsyncStorage
- [ ] Build login screen (email + password)
- [ ] Build sign-up screen (email, password, name)
- [ ] Build confirmation screen (verification code)
- [ ] Add secure token storage via `expo-secure-store` for JWT tokens
- [ ] Handle session restoration on app launch
- [ ] Add logout functionality

### 2.3 Screens

| Screen | Description |
|--------|-------------|
| Login | Email + password fields, "Sign Up" link |
| Sign Up | Email, name, password fields |
| Confirm | Verification code input after sign-up |

---

## Phase 3: Navigation & Core Layout

### 3.1 Navigation Structure (Expo Router)

```
(auth)/
├── login.tsx
├── signup.tsx
└── confirm.tsx
(tabs)/
├── _layout.tsx          # Tab bar config
├── bookmarks.tsx        # Bookmarks feed
├── notes.tsx            # Notes feed
├── search.tsx           # Search across bookmarks + notes
└── settings.tsx         # User settings
```

### 3.2 Tasks

- [ ] Install `expo-router` (file-based routing)
- [ ] Configure auth guard — redirect to login if not authenticated
- [ ] Set up tab navigator with 4 tabs: Bookmarks, Notes, Search, Settings
- [ ] Add tab icons using `@expo/vector-icons` (FontAwesome or similar)
- [ ] Add pull-to-refresh on list screens
- [ ] Add dark mode support with `useColorScheme()` + manual override

---

## Phase 4: Bookmarks

### 4.1 Features

- View bookmarks in a scrollable list (FlatList with pagination)
- Create bookmark (URL input modal, clipboard auto-paste)
- Edit bookmark (title, description)
- Delete bookmark (swipe-to-delete or long-press menu)
- Filter by tag
- Metadata status indicator (pending skeleton, failed badge)

### 4.2 Tasks

- [ ] Build `BookmarkCard` component (title, description, domain, tags)
- [ ] Build bookmarks list screen with `FlatList` and infinite scroll / load-more pagination
- [ ] Build "Add Bookmark" modal with URL input
- [ ] Implement clipboard auto-paste on modal open (`expo-clipboard`)
- [ ] Build "Edit Bookmark" screen/modal
- [ ] Implement swipe-to-delete with confirmation alert
- [ ] Build tag filter chips (horizontal scroll above the list)
- [ ] Connect to shared React Query hooks

### 4.3 Components

| Component | Description |
|-----------|-------------|
| `BookmarkCard` | Card with title, description, domain, tag chips, action buttons |
| `BookmarkList` | FlatList with pull-to-refresh and load-more |
| `AddBookmarkModal` | URL input with clipboard, submit/cancel |
| `EditBookmarkModal` | Title + description fields |
| `TagFilterBar` | Horizontal scrollable tag chips |

---

## Phase 5: Notes

### 5.1 Features

- View notes in a list (title + content preview)
- Create note with markdown editor
- Edit existing notes
- Delete notes

### 5.2 Markdown Editor

Since TipTap doesn't support React Native, we'll use a markdown approach:
- **Editing**: Plain `TextInput` with markdown syntax
- **Preview**: Toggle to rendered markdown view using `react-native-markdown-display`
- **Toolbar**: Floating toolbar with buttons for bold, italic, headers, lists, code, links
- The toolbar inserts markdown syntax at cursor position

### 5.3 Tasks

- [ ] Install `react-native-markdown-display`
- [ ] Build `MarkdownEditor` component with edit/preview toggle
- [ ] Build markdown toolbar (bold, italic, H2, H3, bullet list, numbered list, code, link)
- [ ] Build `NoteCard` component (title + content snippet)
- [ ] Build notes list screen with `FlatList`
- [ ] Build "Add Note" screen (title + markdown editor)
- [ ] Build "Edit Note" screen
- [ ] Implement delete with confirmation
- [ ] **Migration note**: existing notes have HTML content from TipTap. The app should render HTML content read-only (via `react-native-render-html`) and convert to markdown on edit, OR display HTML as-is and only use markdown for new notes.

---

## Phase 6: Tags

### 6.1 Features

- View all tags in a tag management screen (accessible from bookmarks tab or settings)
- Create new tags
- Rename tags (inline edit)
- Delete tags
- Quick-tag a bookmark (tag picker)

### 6.2 Tasks

- [ ] Build `TagManager` screen (list of tags with edit/delete)
- [ ] Build "Create Tag" input
- [ ] Build `QuickTagPicker` bottom sheet for assigning tags to bookmarks
- [ ] Reuse shared tag utility functions (`getTagsForBookmark`, `removeBookmarkFromTag`)

---

## Phase 7: Search

### 7.1 Features

- Search across bookmarks and notes
- Real-time search with debounce
- Results shown in a combined list (bookmarks + notes)

### 7.2 Tasks

- [ ] Build search screen with text input
- [ ] Implement debounced search (300ms)
- [ ] Show mixed results (bookmark cards + note cards)
- [ ] "No results" empty state
- [ ] Recent searches (stored locally via AsyncStorage)

---

## Phase 8: Settings

### 8.1 Features

- Display name editing
- Theme toggle (System / Light / Dark)
- Logout
- App version info
- Account section (email display)

### 8.2 Tasks

- [ ] Build settings screen with sections
- [ ] Implement display name editing with save
- [ ] Theme picker (System / Light / Dark) — synced to backend preferences
- [ ] Logout button with confirmation
- [ ] Show app version from `app.json`

---

## Phase 9: Share Sheet Integration

### 9.1 How It Works

Users can share a URL from any app (Safari, Chrome, Twitter, etc.) to Poucher, which creates a bookmark.

### 9.2 Tasks

- [ ] Configure share extension in `app.json` via `expo-share-intent` or custom config plugin
- [ ] Handle incoming shared URLs
- [ ] Show a mini "Save Bookmark" UI when receiving a shared URL
- [ ] Auto-create bookmark and close share sheet
- [ ] Handle case where user is not logged in (prompt to open app)

### 9.3 Notes

- iOS: Share Extension (runs in a separate process, limited memory)
- Android: Intent filter for `text/plain` and URLs
- Expo has community packages like `expo-share-intent` that simplify this

---

## Phase 10: Push Notifications

### 10.1 Use Cases

- Bookmark metadata extraction complete ("Your bookmark is ready")
- Could extend to: daily digest, tag suggestions, etc.

### 10.2 Tasks

- [ ] Install `expo-notifications`
- [ ] Register for push notifications on app launch
- [ ] Store push token on backend (requires new API endpoint: `PUT /api/users/:id` with `pushToken` field)
- [ ] **Backend change**: Add `push_token` column to Users table
- [ ] **Backend change**: After metadata worker completes, send push notification via AWS SNS or Expo Push API
- [ ] Handle notification taps — deep link to the relevant bookmark
- [ ] Notification permission request flow (ask at appropriate moment, not on first launch)

### 10.3 Backend Changes Required

```sql
-- New migration
ALTER TABLE users ADD COLUMN push_token TEXT;
ALTER TABLE users ADD COLUMN push_platform VARCHAR(10); -- 'ios' or 'android'
```

- Update users handler to accept `pushToken` and `pushPlatform`
- Update metadata worker to send push via Expo Push API after setting `metadata_status = 'ready'`

---

## Phase 11: Offline Support

### 11.1 Strategy

- **Read-only offline**: Cache bookmarks and notes locally so they're viewable without internet
- **Optimistic creates**: Queue bookmark/note creation when offline, sync when back online
- **Conflict resolution**: Last-write-wins for simplicity

### 11.2 Tasks

- [ ] Configure React Query with `persistQueryClient` and `AsyncStorage` adapter
- [ ] Cache bookmark and note lists for offline viewing
- [ ] Implement network status detection via `@react-native-community/netinfo`
- [ ] Build offline queue for mutations (create/update/delete)
- [ ] Process queue when connectivity is restored
- [ ] Show offline indicator banner in the UI
- [ ] Cache user data and tags locally

### 11.3 Libraries

- `@tanstack/react-query-persist-client` — persist React Query cache
- `@react-native-community/netinfo` — network status
- `@react-native-async-storage/async-storage` — local storage

---

## Phase 12: Polish & App Store Prep

### 12.1 Tasks

- [ ] Design app icon and splash screen
- [ ] Configure `app.json` with app name, slug, icons, splash, bundle IDs
- [ ] Set up `eas.json` for development, preview, and production build profiles
- [ ] Configure iOS capabilities (push notifications, share extension, associated domains)
- [ ] Configure Android permissions
- [ ] Add loading states, error states, empty states for all screens
- [ ] Haptic feedback on key actions (delete, create, pull-to-refresh)
- [ ] Keyboard avoidance on forms
- [ ] Accessibility: screen reader labels, minimum touch targets (44pt)
- [ ] Test on physical devices (iOS + Android)
- [ ] Set up Apple Developer Account ($99/year) and Google Play Console ($25 one-time)
- [ ] First build: `eas build --platform all --profile preview`
- [ ] TestFlight (iOS) and internal testing track (Android) for beta
- [ ] App Store and Play Store listing (screenshots, description, privacy policy)
- [ ] Submit for review

---

## Phase Dependency Graph

```
Phase 1 (Setup) ──→ Phase 2 (Auth) ──→ Phase 3 (Navigation)
                                              │
                    ┌─────────────────────────┤
                    ↓              ↓           ↓           ↓
              Phase 4         Phase 5     Phase 6     Phase 8
             (Bookmarks)     (Notes)      (Tags)    (Settings)
                    │              │
                    └──────┬───────┘
                           ↓
                      Phase 7 (Search)
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
         Phase 9       Phase 10     Phase 11
        (Share)       (Push)       (Offline)
                           │
                           ↓
                      Phase 12
                    (App Store)
```

Phases 4, 5, 6, and 8 can be developed in parallel once Phase 3 is complete.

---

## Key Technical Risks

| Risk | Mitigation |
|------|------------|
| **Share extension on Expo** | `expo-share-intent` is community-maintained. If it breaks, may need a custom config plugin or bare workflow for share extension only. |
| **HTML → Markdown migration for notes** | Existing notes are HTML (from TipTap). Need a strategy: render HTML read-only, or convert to markdown with `turndown` before editing. |
| **Offline mutation conflicts** | Keep it simple with last-write-wins. Add timestamps to detect staleness. |
| **Push notifications on both platforms** | Expo Push API abstracts iOS APNs and Android FCM. Needs Expo project setup. |
| **Monorepo shared code** | TypeScript path aliases and workspace config can be fiddly. Test early. |
| **Cognito token refresh** | Need to handle token refresh in background / on 401 responses. The web app may not handle this explicitly. |

---

## Estimated Dependency Additions (mobile)

```json
{
  "expo": "~52.x",
  "expo-router": "~4.x",
  "expo-clipboard": "~7.x",
  "expo-notifications": "~0.29.x",
  "expo-secure-store": "~14.x",
  "expo-share-intent": "~2.x",
  "@expo/vector-icons": "^14.x",
  "@react-native-async-storage/async-storage": "2.x",
  "@react-native-community/netinfo": "^11.x",
  "@tanstack/react-query": "^5.62.0",
  "@tanstack/react-query-persist-client": "^5.x",
  "zustand": "^4.1.4",
  "amazon-cognito-identity-js": "^6.3.16",
  "react-native-markdown-display": "^7.x",
  "react-native-render-html": "^6.x",
  "uuid": "^8.3.2"
}
```
