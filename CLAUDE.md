# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
yarn

# Start development server (Vite)
yarn start

# Run all tests
yarn test

# Run a single test file
yarn test src/components/Tags/Tags.test.tsx

# Run tests in watch mode (default behavior)
yarn test --watch
```

## Architecture

PoucherWeb is a bookmark management application with a React frontend and serverless backend.

### Frontend Stack
- **React 18** with TypeScript and Vite
- **Apollo Client** for GraphQL data fetching (configured in `src/main.tsx`)
- **Auth0** for authentication (wrapped at app root in `src/App.tsx`)
- **Zustand** for client state (stores in `src/store/`)
- **Tailwind CSS** with DaisyUI components

### State Management
- **Zustand stores** (`src/store/`):
  - `page-store.ts` - pagination, search, bookmarks list, category filtering
  - `modal-store.ts` - modal open/close state and content
- **React Context** (`src/contexts/`):
  - `user-context.tsx` - user data and tags from Auth0/GraphQL

### Component Structure
Components live in `src/components/` with each component in its own directory containing:
- Main component file (e.g., `Tags.tsx`)
- Index file for exports
- Test file when applicable (e.g., `Tags.test.tsx`)

`AdminScreen` is the main authenticated view that renders the drawer layout with Tags sidebar, Bookmarks grid, and navigation.

### Testing
- **Vitest** with jsdom environment
- **React Testing Library** for component tests
- Test utilities in `src/utils/test-utils.tsx` provide wrapped render with mocked providers (Auth0, Apollo MockedProvider, UserProvider)
- Mock data defined in `src/test/testData.ts`

### Environment Variables
App uses Vite's `import.meta.env` for:
- `VITE_AUTH0_DOMAIN` - Auth0 domain
- `VITE_AUTH0_CLIENT_ID` - Auth0 client ID
- `VITE_SERVER_ENDPOINT` - GraphQL API endpoint
