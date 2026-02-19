"""
Notes Lambda Handler

Endpoints:
    GET    /api/notes      - Search/list notes
    POST   /api/notes      - Create note
    PUT    /api/notes/:id  - Update note
    DELETE /api/notes/:id  - Delete note
"""
import json
import re
import sys
import os
from uuid import UUID

# Add shared module to path for Lambda
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.db import get_session, User, Note
from shared.utils import validate_token, success, error, bad_request, unauthorized, not_found
from shared.utils.auth import AuthError
from shared.utils.response import options_response


def handler(event, context):
    """Main Lambda handler - routes to appropriate function."""
    if "httpMethod" in event:
        http_method = event.get("httpMethod", "")
        path = event.get("path", "")
    else:
        request_context = event.get("requestContext", {})
        http_info = request_context.get("http", {})
        http_method = http_info.get("method", "")
        path = event.get("rawPath", "")

    # Handle CORS preflight
    if http_method == "OPTIONS":
        return options_response()

    # Extract note ID from path if present
    id_match = re.match(r"^/api/notes/([a-f0-9-]+)$", path)
    note_id = id_match.group(1) if id_match else None

    # Route requests
    if path == "/api/notes":
        if http_method == "GET":
            return search(event, context)
        elif http_method == "POST":
            return create(event, context)

    if note_id:
        if http_method == "PUT":
            return update(event, context, note_id)
        elif http_method == "DELETE":
            return delete(event, context, note_id)

    return error("Not found", status=404)


def _get_user_by_cognito_sub(db, cognito_sub: str) -> User:
    """Get user by Cognito sub, returns None if not found."""
    return db.query(User).filter(User.cognito_sub == cognito_sub).first()


def search(event, context):
    """
    GET /api/notes

    Query params:
        authorID - Filter by author (required for security)
        title    - Search title (partial match)
        offset   - Pagination offset (default: 0)
        limit    - Pagination limit (default: 15)
    """
    try:
        token_user = validate_token(event)
    except AuthError as e:
        return unauthorized(str(e))

    params = event.get("queryStringParameters", {}) or {}

    offset = int(params.get("offset", 0))
    limit = min(int(params.get("limit", 15)), 100)
    title_search = params.get("title", "")

    try:
        with get_session() as db:
            user = _get_user_by_cognito_sub(db, token_user["sub"])
            if not user:
                return unauthorized("User not found")

            query = db.query(Note).filter(Note.author_id == user.id)

            if title_search:
                query = query.filter(Note.title.ilike(f"%{title_search}%"))

            total_count = query.count()

            notes = (
                query
                .order_by(Note.created_at.desc())
                .offset(offset)
                .limit(limit)
                .all()
            )

            return success({
                "notes": [n.to_dict() for n in notes],
                "count": total_count,
            })

    except Exception as e:
        return error(f"Database error: {str(e)}")


def create(event, context):
    """
    POST /api/notes

    Request body:
        {
            "title": "Note title",
            "content": "<p>HTML content from Tiptap</p>"
        }
    """
    try:
        token_user = validate_token(event)
    except AuthError as e:
        return unauthorized(str(e))

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return bad_request("Invalid JSON body")

    title = body.get("title", "").strip()
    content = body.get("content", "")

    try:
        with get_session() as db:
            user = _get_user_by_cognito_sub(db, token_user["sub"])
            if not user:
                return unauthorized("User not found")

            note = Note(
                author_id=user.id,
                title=title,
                content=content,
            )
            db.add(note)
            db.flush()

            return success({"note": note.to_dict()}, status=201)

    except Exception as e:
        return error(f"Database error: {str(e)}")


def update(event, context, note_id: str):
    """
    PUT /api/notes/:id

    Request body:
        {
            "title": "Updated title",
            "content": "<p>Updated HTML content</p>"
        }
    """
    try:
        token_user = validate_token(event)
    except AuthError as e:
        return unauthorized(str(e))

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return bad_request("Invalid JSON body")

    try:
        note_uuid = UUID(note_id)
    except ValueError:
        return bad_request("Invalid note ID")

    try:
        with get_session() as db:
            user = _get_user_by_cognito_sub(db, token_user["sub"])
            if not user:
                return unauthorized("User not found")

            note = db.query(Note).filter(
                Note.id == note_uuid,
                Note.author_id == user.id
            ).first()

            if not note:
                return not_found("Note not found")

            if "title" in body:
                note.title = body["title"].strip()
            if "content" in body:
                note.content = body["content"]

            return success({"note": note.to_dict()})

    except Exception as e:
        return error(f"Database error: {str(e)}")


def delete(event, context, note_id: str):
    """
    DELETE /api/notes/:id
    """
    try:
        token_user = validate_token(event)
    except AuthError as e:
        return unauthorized(str(e))

    try:
        note_uuid = UUID(note_id)
    except ValueError:
        return bad_request("Invalid note ID")

    try:
        with get_session() as db:
            user = _get_user_by_cognito_sub(db, token_user["sub"])
            if not user:
                return unauthorized("User not found")

            note = db.query(Note).filter(
                Note.id == note_uuid,
                Note.author_id == user.id
            ).first()

            if not note:
                return not_found("Note not found")

            note_data = note.to_dict()
            db.delete(note)

            return success({"note": note_data})

    except Exception as e:
        return error(f"Database error: {str(e)}")
