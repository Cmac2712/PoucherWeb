# Poucher.io

A modern, full-stack bookmark management application that helps you save, organize, and search all your bookmarks in one place. Poucher automatically extracts metadata and generates screenshots for every bookmark, making it easy to find what you need.

[Try Poucher.io here](https://poucher.io)

## Features

### Bookmark Management
- **Smart Bookmark Creation**: Add bookmarks with automatic metadata extraction (title, description, and screenshots)
- **Clipboard Integration**: Automatically detects URLs in your clipboard when creating bookmarks
- **Rich Preview Cards**: View bookmarks with thumbnails, titles, and descriptions
- **Full-Text Search**: Search bookmarks by title or description in real-time
- **Quick Actions**: Edit or delete bookmarks with hover-activated controls
- **Pagination**: Navigate large collections with responsive pagination controls

### Organization & Filtering
- **Tag-Based Categories**: Organize bookmarks with custom tags
- **Category Filtering**: Filter bookmarks by tag or view all at once
- **Bookmark Counts**: See how many bookmarks are in each category
- **Tag Management**: Create, update, and delete tags with confirmation dialogs

### User Experience
- **Modern UI**: Clean, dark-themed interface built with Tailwind CSS and DaisyUI
- **Fully Responsive**: Drawer navigation that adapts to mobile and desktop
- **Secure Authentication**: Sign in with Auth0 OAuth
- **User Profile**: Display your profile picture, name, and email in the sidebar
- **Analytics**: Integrated with Google Analytics 4 for usage insights

### Advanced Features
- **Automatic Screenshots**: Backend generates page screenshots using headless Chrome
- **Video Support**: Embedded video preview for video URLs
- **Real-time Updates**: Optimistic UI updates with React Query
- **Mock Development Mode**: Develop and test without a live backend using MSW

## Tech Stack

### Frontend
- **[React 18](https://react.dev/)** - Modern React with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[DaisyUI](https://daisyui.com/)** - Tailwind component library

### State Management & Data Fetching
- **[React Query](https://tanstack.com/query)** (@tanstack/react-query) - Server state management with caching, mutations, and invalidation
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight client state management
- **Custom API Client** - Fetch-based REST client with authentication

### Authentication
- **[Auth0](https://auth0.com/)** (@auth0/auth0-react) - OAuth authentication and user management

### UI Components & Icons
- **[FontAwesome](https://fontawesome.com/)** - Icon library with React components
- **[React Responsive](https://github.com/yocontra/react-responsive)** - Responsive design utilities

### Backend (Serverless)
- **[AWS Lambda](https://aws.amazon.com/lambda/)** - Serverless compute
- **[AWS S3](https://aws.amazon.com/s3/)** - Screenshot and image storage
- **[AWS CloudFront](https://aws.amazon.com/cloudfront/)** - CDN for assets
- **[AWS RDS](https://aws.amazon.com/rds/)** - PostgreSQL database
- **[Serverless Framework](https://www.serverless.com/)** - Infrastructure as code

### Database & ORM
- **[Prisma](https://www.prisma.io/)** - Type-safe database ORM

### Web Scraping & Metadata
- **[Puppeteer](https://pptr.dev/)** - Headless Chrome automation
- **[@sparticuz/chrome-aws-lambda](https://github.com/Sparticuz/chromium)** - Chrome for AWS Lambda
- **[Metascraper](https://metascraper.js.org/)** - Intelligent metadata extraction
- **[html-get](https://www.npmjs.com/package/html-get)** - HTML fetching with redirects

### Testing & Development
- **[Vitest](https://vitest.dev/)** - Blazing fast unit test framework
- **[React Testing Library](https://testing-library.com/react)** - Component testing utilities
- **[Mock Service Worker (MSW)](https://mswjs.io/)** - API mocking for development and testing
- **[jsdom](https://github.com/jsdom/jsdom)** - DOM implementation for testing

### Developer Tools
- **[ESLint](https://eslint.org/)** - JavaScript/TypeScript linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[TypeScript ESLint](https://typescript-eslint.io/)** - TypeScript linting rules

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Yarn package manager

### Installation

Install dependencies:
```bash
yarn
```

### Development

Start the development server:
```bash
yarn start
```

Start with mock API (no backend required):
```bash
yarn start:mock
```

### Testing

Run all tests:
```bash
yarn test
```

Run a specific test file:
```bash
yarn test src/components/Tags/Tags.test.tsx
```

Run tests in watch mode (default):
```bash
yarn test --watch
```

### Environment Variables

Create a `.env` file with the following variables:

```env
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_SERVER_ENDPOINT=your-api-endpoint
VITE_ENABLE_MSW=false
```

## Project Structure

```
PoucherWeb/
├── src/
│   ├── api/              # API client and React Query hooks
│   ├── components/       # React components
│   ├── contexts/         # React Context providers
│   ├── store/            # Zustand stores
│   ├── utils/            # Utility functions and test helpers
│   ├── test/             # Test data and mocks
│   ├── mocks/            # MSW mock handlers
│   ├── App.tsx           # App root with Auth0 provider
│   └── main.tsx          # Entry point with React Query setup
├── public/               # Static assets
└── CLAUDE.md             # AI assistant guidance
```

## Architecture

Poucher uses a modern React architecture with clear separation of concerns:

- **API Layer**: REST API client with React Query hooks for all data operations
- **State Management**:
  - React Query for server state (bookmarks, tags, user data)
  - Zustand for UI state (modals, pagination, search)
  - React Context for user session data
- **Component Structure**: Modular components with co-located tests
- **Testing**: Comprehensive test utilities with mocked providers

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation.

## Contributing

This is a personal project, but feedback and suggestions are welcome! Please open an issue to discuss any changes.

## License

Private - All rights reserved

## Links

- [Live Application](https://poucher.io)
- [GitHub Repository](https://github.com/Cmac2712/PoucherWeb)
