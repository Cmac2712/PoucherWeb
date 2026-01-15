# PoucherWeb Services - Complete Documentation

This document provides comprehensive documentation for the PoucherWeb serverless backend, including architecture, API endpoints, database models, and implementation details.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Shared Module](#shared-module)
   - [Database Connection](#database-connection)
   - [Database Models](#database-models)
   - [Authentication Utilities](#authentication-utilities)
   - [Response Helpers](#response-helpers)
3. [Service Modules](#service-modules)
   - [Auth Service](#auth-service)
   - [Bookmarks Service](#bookmarks-service)
   - [Tags Service](#tags-service)
   - [Users Service](#users-service)
   - [Screenshot Service](#screenshot-service)
4. [Database Schema](#database-schema)
5. [Configuration](#configuration)
6. [Deployment](#deployment)

---

## Architecture Overview

PoucherWeb services is a **serverless backend** built for AWS Lambda with the following stack:

| Component | Technology |
|-----------|------------|
| Runtime | Python 3.11 |
| Framework | SQLAlchemy ORM |
| Database | PostgreSQL with UUID primary keys |
| Authentication | AWS Cognito (JWT validation) |
| Deployment | AWS Lambda (serverless functions) |
| Triggers | API Gateway (HTTP) and SQS (async) |
| Storage | AWS S3 (screenshots) |

### Directory Structure

```
services/
├── shared/                    # Shared code (DB, Auth, Response helpers)
│   ├── db/
│   │   ├── __init__.py       # Exports: get_session, get_engine, User, Bookmark, Tag, BookmarkTag
│   │   ├── connection.py     # Database connection pooling and session management
│   │   └── models.py         # SQLAlchemy ORM models
│   └── utils/
│       ├── __init__.py       # Exports auth & response utilities
│       ├── auth.py           # Cognito JWT validation
│       └── response.py       # Lambda response formatting with CORS
├── auth/                      # Authentication service (user session init)
│   └── handler.py
├── bookmarks/                 # Bookmarks CRUD operations
│   └── handler.py
├── tags/                      # Tags CRUD operations
│   └── handler.py
├── users/                     # User profile updates
│   └── handler.py
├── screenshot/                # Async screenshot capture service
│   └── handler.py
├── migrations/                # Database schema SQL
│   └── 001_initial_schema.sql
├── pyproject.toml            # Project config & dependencies
├── requirements.txt          # Production dependencies
├── .env.example              # Environment variables template
└── README.md                 # Quick start guide
```

### Request Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│ API Gateway │────▶│   Lambda    │────▶│  PostgreSQL │
│  (React)    │     │             │     │  (Python)   │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       │                                       ▼
       │                              ┌─────────────┐
       │                              │   Cognito   │
       │                              │ (JWT Auth)  │
       │                              └─────────────┘
       │                                       │
       ▼                                       ▼
┌─────────────┐                       ┌─────────────┐
│    Auth0    │──────────────────────▶│     S3      │
│  (Frontend) │                       │(Screenshots)│
└─────────────┘                       └─────────────┘
```

---

## Shared Module

The `shared/` directory contains code used across all Lambda functions.

### Database Connection

**File:** `shared/db/connection.py`

Manages PostgreSQL connections with SQLAlchemy, optimized for Lambda's execution model.

#### Connection Pool Configuration

```python
engine = create_engine(
    DATABASE_URL,
    pool_size=5,           # Maintain 5 connections in pool
    max_overflow=10,       # Allow up to 10 additional connections
    pool_timeout=30,       # Wait 30s for available connection
    pool_recycle=1800,     # Recycle connections after 30 minutes
    pool_pre_ping=True     # Verify connection health before use
)
```

#### Usage

```python
from shared.db import get_session

def handler(event, context):
    with get_session() as db:
        users = db.query(User).all()
        # Session auto-commits on successful exit
        # Auto-rollback on exception
    return success({"users": users})
```

#### Key Functions

| Function | Description |
|----------|-------------|
| `get_engine()` | Returns singleton SQLAlchemy engine (lazy-loaded) |
| `get_session()` | Context manager yielding database session |

#### Error Handling

- Automatic rollback on exceptions
- Manual commit required for explicit control
- Connection health verified before each use (`pool_pre_ping`)

---

### Database Models

**File:** `shared/db/models.py`

Four main SQLAlchemy ORM models with relationships:

#### User Model

```python
class User(Base):
    __tablename__ = "users"

    id = Column(UUID, primary_key=True, default=uuid4)
    cognito_sub = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    picture_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    bookmarks = relationship("Bookmark", back_populates="author", cascade="all, delete-orphan")
    tags = relationship("Tag", back_populates="author", cascade="all, delete-orphan")
```

**Methods:**
- `to_dict()` → `{"id", "email", "name", "picture"}`

#### Bookmark Model

```python
class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(UUID, primary_key=True, default=uuid4)
    author_id = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(Text, nullable=False)
    video_url = Column(Text, nullable=True)
    screenshot_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    author = relationship("User", back_populates="bookmarks")
    tags = relationship("Tag", secondary="bookmark_tags", back_populates="bookmarks")
```

**Methods:**
- `to_dict(include_tags=False)` → Returns camelCase keys: `authorID`, `videoURL`, `screenshotURL`, `createdAt`

#### Tag Model

```python
class Tag(Base):
    __tablename__ = "tags"
    __table_args__ = (UniqueConstraint("author_id", "title"),)  # Per-user unique names

    id = Column(UUID, primary_key=True, default=uuid4)
    author_id = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    author = relationship("User", back_populates="tags")
    bookmarks = relationship("Bookmark", secondary="bookmark_tags", back_populates="tags")
```

**Methods:**
- `to_dict()` → Returns `{"ID", "title", "authorID", "bookmarkID"}`
  - Note: `bookmarkID` uses legacy JSON string format `{"list": ["id1", "id2"]}`

#### BookmarkTag (Junction Table)

```python
bookmark_tags = Table(
    "bookmark_tags",
    Base.metadata,
    Column("bookmark_id", UUID, ForeignKey("bookmarks.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", DateTime(timezone=True), server_default=func.now())
)
```

#### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │       │  bookmark_tags  │       │     Tag     │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ bookmark_id(FK) │    ┌──│ id (PK)     │
│ cognito_sub │  │    │ tag_id (FK)     │────┘  │ author_id   │──┐
│ email       │  │    │ created_at      │       │ title       │  │
│ name        │  │    └─────────────────┘       │ created_at  │  │
│ picture_url │  │            ▲                 │ updated_at  │  │
│ created_at  │  │            │                 └─────────────┘  │
│ updated_at  │  │    ┌───────┴───────┐                          │
└─────────────┘  │    │               │                          │
       │         │    │   Bookmark    │                          │
       │         │    ├───────────────┤                          │
       │         └───▶│ id (PK)       │                          │
       │              │ author_id(FK) │◀─────────────────────────┘
       └─────────────▶│ title         │
         1:N          │ description   │
                      │ url           │
                      │ video_url     │
                      │ screenshot_url│
                      │ created_at    │
                      │ updated_at    │
                      └───────────────┘
```

---

### Authentication Utilities

**File:** `shared/utils/auth.py`

Handles AWS Cognito JWT validation for all protected endpoints.

#### JWT Validation Flow

```
1. Extract Authorization header (case-insensitive)
2. Validate "Bearer " prefix
3. Fetch Cognito JWKS from well-known endpoint
4. Find matching key by KID in token header
5. Decode JWT with RS256 algorithm
6. Verify issuer, audience, and expiration
```

#### Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `get_jwks()` | None | dict | Cached JWKS fetching (`@lru_cache`) |
| `get_user_from_token(token)` | JWT string | dict | Decoded user info |
| `validate_token(event)` | Lambda event | dict | Extract & validate Bearer token |

#### User Info Returned

```python
{
    "sub": "cognito-user-id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://example.com/avatar.jpg"  # Optional
}
```

#### Exception Handling

```python
class AuthError(Exception):
    """Raised on any authentication failure"""
    pass
```

Common auth errors:
- Missing Authorization header
- Invalid Bearer token format
- Expired token
- Invalid signature
- Wrong issuer/audience

#### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `COGNITO_REGION` | `eu-west-2` | AWS region for Cognito |
| `COGNITO_USER_POOL_ID` | Required | Cognito User Pool ID |
| `COGNITO_CLIENT_ID` | Required | Cognito App Client ID |

---

### Response Helpers

**File:** `shared/utils/response.py`

Standardized Lambda response formatting with CORS support.

#### CORS Headers (Applied Automatically)

```python
{
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
}
```

#### Response Functions

| Function | Status | Body | Use Case |
|----------|--------|------|----------|
| `success(data, status=200)` | 200/custom | `data` as JSON | Successful operations |
| `error(message, status=500)` | 500/custom | `{"error": message}` | Server errors |
| `bad_request(message)` | 400 | `{"error": message}` | Invalid input |
| `unauthorized(message)` | 401 | `{"error": message}` | Auth failures |
| `not_found(message)` | 404 | `{"error": message}` | Resource not found |
| `options_response()` | 200 | Empty | CORS preflight |

#### Usage Example

```python
from shared.utils import success, bad_request, unauthorized

def handler(event, context):
    try:
        user = validate_token(event)
    except AuthError:
        return unauthorized("Invalid token")

    body = json.loads(event.get("body") or "{}")
    if not body.get("title"):
        return bad_request("Title is required")

    # ... create resource ...
    return success({"bookmark": bookmark.to_dict()}, status=201)
```

---

## Service Modules

### Auth Service

**File:** `auth/handler.py`

Initializes user sessions and manages user creation/updates.

#### Endpoint

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/init` | Initialize user session |

#### Request

```json
{
  "id": "cognito-sub",        // Optional, uses token if missing
  "email": "user@example.com", // Optional, uses token if missing
  "name": "User Name"          // Optional, uses token if missing
}
```

#### Response (201 Created)

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://example.com/avatar.jpg"
  },
  "tags": [
    {
      "ID": "uuid",
      "title": "Category Name",
      "authorID": "uuid",
      "bookmarkID": "{\"list\": [\"bookmark-id-1\"]}"
    }
  ]
}
```

#### Logic Flow

```
1. Validate Bearer token via Cognito JWT
2. Use token fields as defaults if request body missing
3. Find existing user by cognito_sub
4. If found: update email/name if changed
5. If not found: create new user (includes picture from token)
6. Fetch all user's tags
7. Return user info + tag list
```

#### Security

- Token validation required
- User data from token is trusted
- Creates user record on first login (auto-provisioning)

---

### Bookmarks Service

**File:** `bookmarks/handler.py`

Full CRUD operations for bookmark management.

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bookmarks` | Search/list bookmarks |
| POST | `/api/bookmarks` | Create bookmark |
| PUT | `/api/bookmarks/{id}` | Update bookmark |
| DELETE | `/api/bookmarks/{id}` | Delete bookmark |

---

#### GET - Search/List Bookmarks

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | - | Partial search (case-insensitive) |
| `description` | string | - | Partial search (case-insensitive) |
| `offset` | integer | 0 | Pagination offset |
| `limit` | integer | 15 | Results per page (max: 100) |
| `ids` | string | - | Comma-separated bookmark IDs |

**Response:**

```json
{
  "bookmarks": [
    {
      "id": "uuid",
      "authorID": "uuid",
      "title": "Bookmark Title",
      "description": "Description text",
      "url": "https://example.com",
      "videoURL": null,
      "screenshotURL": "https://s3.../screenshot.png",
      "createdAt": "2024-01-15T12:00:00Z",
      "tags": [
        {"ID": "uuid", "title": "Category"}
      ]
    }
  ],
  "count": 42
}
```

**Notes:**
- Always filtered by authenticated user's ID (enforced server-side)
- Returns total count before pagination applied
- Ordered by `created_at DESC`

---

#### POST - Create Bookmark

**Request:**

```json
{
  "title": "Bookmark Title",
  "url": "https://example.com",
  "description": "Optional description",
  "videoURL": "Optional video URL",
  "tagIds": ["tag-uuid-1", "tag-uuid-2"]
}
```

**Response (201 Created):**

```json
{
  "bookmark": {
    "id": "uuid",
    "authorID": "uuid",
    "title": "Bookmark Title",
    "url": "https://example.com",
    "description": "Optional description",
    "videoURL": null,
    "screenshotURL": null,
    "createdAt": "2024-01-15T12:00:00Z",
    "tags": []
  }
}
```

**Validation:**
- `title` and `url` are required
- Invalid tag UUIDs are silently ignored
- Tag ownership validated (only user's tags allowed)

---

#### PUT - Update Bookmark

**Request:** (all fields optional)

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "url": "https://new-url.com",
  "videoURL": "https://video.com",
  "screenshotURL": "https://s3.../new-screenshot.png",
  "tagIds": ["tag-uuid-1"]
}
```

**Response:** Updated bookmark object

**Notes:**
- Partial updates supported
- `tagIds` replaces all existing tag associations
- Only owner can update

---

#### DELETE - Delete Bookmark

**Response:** Deleted bookmark object

**Notes:**
- Only owner can delete
- Cascade deletes `bookmark_tags` entries

---

### Tags Service

**File:** `tags/handler.py`

CRUD operations for tag/category management.

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/tags` | Create tag |
| PUT | `/api/tags/{id}` | Update tag |
| DELETE | `/api/tags/{id}` | Delete tag |

---

#### POST - Create Tag

**Request:**

```json
{
  "title": "Category Name",
  "bookmarkID": "{\"list\": [\"bookmark-id-1\", \"bookmark-id-2\"]}"
}
```

**Response (201 Created):**

```json
{
  "tag": {
    "ID": "uuid",
    "title": "Category Name",
    "authorID": "uuid",
    "bookmarkID": "{\"list\": [\"bookmark-id-1\", \"bookmark-id-2\"]}"
  }
}
```

**Validation:**
- Tag names must be unique per user
- `bookmarkID` uses legacy JSON string format for frontend compatibility
- Bookmark ownership validated

---

#### PUT - Update Tag

**Request:** (all fields optional)

```json
{
  "title": "New Category Name",
  "bookmarkID": "{\"list\": [\"bookmark-id-3\"]}"
}
```

**Response:** Updated tag object

**Notes:**
- Only owner can update
- Tag name uniqueness enforced
- `bookmarkID` replaces all associations

---

#### DELETE - Delete Tag

**Response:** Deleted tag object

**Notes:**
- Only owner can delete
- Cascade deletes `bookmark_tags` entries
- Does NOT delete associated bookmarks

---

### Users Service

**File:** `users/handler.py`

User profile management.

#### Endpoint

| Method | Path | Description |
|--------|------|-------------|
| PUT | `/api/users/{id}` | Update user profile |

---

#### PUT - Update User Profile

**Request:** (all fields optional)

```json
{
  "name": "New Display Name",
  "picture": "https://example.com/new-avatar.jpg"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "New Display Name",
    "picture": "https://example.com/new-avatar.jpg"
  }
}
```

**Security:**
- Users can only update their own profile
- Path `{id}` must match authenticated user's ID
- Returns 401 if ownership check fails

---

### Screenshot Service

**File:** `screenshot/handler.py`

Captures website screenshots and uploads to S3.

#### Endpoints

| Trigger | Path/Source | Description |
|---------|-------------|-------------|
| HTTP | POST `/api/screenshot` | Manual screenshot capture |
| SQS | Queue messages | Async background processing |

---

#### POST - Capture Screenshot

**Request:**

```json
{
  "bookmarkId": "uuid",
  "url": "https://example.com"
}
```

**Response:**

```json
{
  "screenshotUrl": "https://bucket.s3.region.amazonaws.com/screenshots/uuid.png"
}
```

---

#### SQS - Async Processing

**Message Format:**

```json
{
  "bookmarkId": "uuid",
  "url": "https://example.com"
}
```

**Response:**

```json
{
  "processed": 5,
  "results": [
    {"bookmarkId": "uuid", "success": true, "url": "https://s3.../screenshot.png"},
    {"bookmarkId": "uuid", "success": false, "error": "Timeout"}
  ]
}
```

---

#### Screenshot Capture Methods

**1. External API (Recommended for Lambda)**

Uses third-party screenshot services:
- screenshotapi.net
- urlbox.io
- screenshot.guru

```python
# Configured via environment variable
SCREENSHOT_API_KEY=your-api-key
```

**2. Playwright (Requires Lambda Layer)**

Headless browser automation for self-hosted captures:

```python
# Chrome arguments for Lambda
--disable-gpu
--single-process
--no-sandbox
--disable-dev-shm-usage

# Viewport: 1280x720
# Timeout: 30 seconds
# Wait: Network idle
```

---

#### S3 Upload Configuration

| Setting | Value |
|---------|-------|
| Bucket | `SCREENSHOT_BUCKET` (default: "poucher-screenshots") |
| Key Pattern | `screenshots/{bookmark_id}.png` |
| Cache-Control | `max-age=31536000` (1 year) |
| Content-Type | `image/png` |

---

## Database Schema

**File:** `migrations/001_initial_schema.sql`

### Tables

#### users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cognito_sub VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### bookmarks

```sql
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    video_url TEXT,
    screenshot_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookmarks_author ON bookmarks(author_id);
CREATE INDEX idx_bookmarks_created ON bookmarks(created_at DESC);
CREATE INDEX idx_bookmarks_title_search ON bookmarks USING GIN (to_tsvector('english', title));
```

#### tags

```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(author_id, title)
);

-- Indexes
CREATE INDEX idx_tags_author ON tags(author_id);
```

#### bookmark_tags

```sql
CREATE TABLE bookmark_tags (
    bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (bookmark_id, tag_id)
);

-- Indexes
CREATE INDEX idx_bookmark_tags_tag ON bookmark_tags(tag_id);
CREATE INDEX idx_bookmark_tags_bookmark ON bookmark_tags(bookmark_id);
```

### Triggers

Auto-update `updated_at` timestamps:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookmarks_updated_at
    BEFORE UPDATE ON bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Configuration

### Environment Variables

**File:** `.env.example`

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/poucher

# Cognito Authentication
COGNITO_REGION=eu-west-2
COGNITO_USER_POOL_ID=eu-west-2_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# AWS (for S3 screenshots)
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=your-access-key        # Not needed in Lambda (uses IAM role)
AWS_SECRET_ACCESS_KEY=your-secret-key    # Not needed in Lambda (uses IAM role)

# Screenshot Service
SCREENSHOT_BUCKET=poucher-screenshots
SCREENSHOT_API_KEY=your-api-key          # Optional, for external API
```

### Dependencies

**Production (`requirements.txt`):**

```
sqlalchemy>=2.0.0,<3.0.0          # ORM
psycopg2-binary>=2.9.0,<3.0.0     # PostgreSQL driver
python-jose[cryptography]>=3.3.0  # JWT validation
boto3>=1.28.0,<2.0.0              # AWS SDK
```

**Development (`pyproject.toml`):**

```
pytest>=7.4.0                      # Testing
pytest-cov>=4.1.0                  # Coverage
moto>=4.2.0                        # AWS mocking
httpx>=0.25.0                      # HTTP testing
ruff>=0.1.0                        # Linting
black>=23.0.0                      # Formatting
mypy>=1.6.0                        # Type checking
```

### Code Quality Settings

```toml
[tool.ruff]
line-length = 100
select = ["E", "W", "F", "I", "B", "C4", "UP"]

[tool.black]
line-length = 100

[tool.mypy]
python_version = "3.11"
ignore_missing_imports = true
```

---

## Deployment

### Lambda Configuration

| Setting | Value |
|---------|-------|
| Runtime | Python 3.11 |
| Handler | `{service}.handler.handler` |
| Timeout | 30 seconds |
| Memory | 256-512 MB (depending on service) |

### IAM Permissions Required

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::poucher-screenshots/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:*:*:screenshot-queue"
    }
  ]
}
```

### Database Setup

```bash
# Create PostgreSQL database
createdb poucher

# Enable UUID extension
psql -d poucher -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# Run migrations
psql -d poucher -f migrations/001_initial_schema.sql
```

### VPC Configuration

For RDS access, Lambda functions need:
- VPC subnets with NAT Gateway (for external API calls)
- Security group allowing PostgreSQL port (5432)
- RDS security group allowing Lambda security group

---

## Security Model

### Authentication Flow

```
1. Frontend authenticates with Auth0
2. Auth0 federates to AWS Cognito
3. Frontend receives Cognito JWT
4. All API calls include: Authorization: Bearer <jwt>
5. Backend validates JWT against Cognito JWKS
6. User identified by cognito_sub claim
```

### Authorization Rules

| Resource | Read | Create | Update | Delete |
|----------|------|--------|--------|--------|
| Bookmarks | Own only | Authenticated | Owner only | Owner only |
| Tags | Own only | Authenticated | Owner only | Owner only |
| Users | Own only | Auto (on auth) | Owner only | N/A |

### Data Isolation

- All queries filter by `author_id`
- Server-side enforcement (ignores client-provided author IDs)
- Cascade deletes maintain referential integrity

---

## Error Handling

### Standard Error Responses

```json
{
  "statusCode": 400,
  "headers": { "Access-Control-Allow-Origin": "*", ... },
  "body": "{\"error\": \"Title is required\"}"
}
```

### Error Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| 400 | Bad Request | Missing required fields, invalid JSON |
| 401 | Unauthorized | Missing/invalid/expired token |
| 404 | Not Found | Resource doesn't exist or not owned by user |
| 500 | Server Error | Database errors, unexpected exceptions |

---

## Testing

### Run Tests

```bash
cd services
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
pytest
```

### Test Coverage

```bash
pytest --cov=. --cov-report=html
```

### Local Handler Testing

```python
from auth.handler import handler

event = {
    "httpMethod": "POST",
    "path": "/api/auth/init",
    "headers": {"Authorization": "Bearer <token>"},
    "body": '{"email": "test@example.com", "name": "Test User"}'
}

response = handler(event, None)
print(response)
```

---

*Documentation generated for PoucherWeb Services v1.0*
