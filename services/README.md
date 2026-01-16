# PoucherWeb Services

Python Lambda functions for the PoucherWeb backend.

## Structure

```
services/
├── shared/              # Shared code across all lambdas
│   ├── db/              # Database models and connection
│   └── utils/           # Auth, response helpers
├── auth/                # POST /api/auth/init
├── bookmarks/           # CRUD /api/bookmarks
├── tags/                # CRUD /api/tags
├── users/               # PUT /api/users/:id
├── screenshot/          # Async screenshot worker
└── migrations/          # SQL migrations
```

## Setup

### 1. Install dependencies

```bash
cd services
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -e ".[dev]"
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Set up database

```bash
# Create PostgreSQL database
createdb poucher

# Run migrations
psql -d poucher -f migrations/001_initial_schema.sql
```

## Development

### Run tests

```bash
pytest
```

### Lint & format

```bash
ruff check .
black .
mypy .
```

### Local testing

You can test handlers locally:

```python
from auth.handler import handler

event = {
    "httpMethod": "POST",
    "path": "/api/auth/init",
    "headers": {"Authorization": "Bearer <token>"},
    "body": '{"id": "sub", "email": "test@example.com", "name": "Test"}'
}
response = handler(event, None)
print(response)
```

## Deployment

### AWS SAM

```yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Runtime: python3.11
    Timeout: 30
    Environment:
      Variables:
        DATABASE_URL: !Ref DatabaseUrl
        COGNITO_REGION: !Ref CognitoRegion
        COGNITO_USER_POOL_ID: !Ref CognitoUserPoolId
        COGNITO_CLIENT_ID: !Ref CognitoClientId

Resources:
  AuthFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: auth.handler.handler
      CodeUri: .
      Events:
        Init:
          Type: Api
          Properties:
            Path: /api/auth/init
            Method: post

  BookmarksFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: bookmarks.handler.handler
      CodeUri: .
      Events:
        List:
          Type: Api
          Properties:
            Path: /api/bookmarks
            Method: get
        Create:
          Type: Api
          Properties:
            Path: /api/bookmarks
            Method: post
        Update:
          Type: Api
          Properties:
            Path: /api/bookmarks/{id}
            Method: put
        Delete:
          Type: Api
          Properties:
            Path: /api/bookmarks/{id}
            Method: delete
```

### Serverless Framework

```yaml
# serverless.yml
service: poucher-api

provider:
  name: aws
  runtime: python3.11
  region: eu-west-2
  environment:
    DATABASE_URL: ${env:DATABASE_URL}
    COGNITO_REGION: ${env:COGNITO_REGION}
    COGNITO_USER_POOL_ID: ${env:COGNITO_USER_POOL_ID}
    COGNITO_CLIENT_ID: ${env:COGNITO_CLIENT_ID}

functions:
  auth:
    handler: auth.handler.handler
    events:
      - http:
          path: api/auth/init
          method: post
          cors: true

  bookmarks:
    handler: bookmarks.handler.handler
    events:
      - http:
          path: api/bookmarks
          method: any
          cors: true
      - http:
          path: api/bookmarks/{id}
          method: any
          cors: true
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/init | Initialize user session |
| GET | /api/bookmarks | Search/list bookmarks |
| POST | /api/bookmarks | Create bookmark |
| PUT | /api/bookmarks/:id | Update bookmark |
| DELETE | /api/bookmarks/:id | Delete bookmark |
| POST | /api/tags | Create tag |
| PUT | /api/tags/:id | Update tag |
| DELETE | /api/tags/:id | Delete tag |
| PUT | /api/users/:id | Update user profile |
