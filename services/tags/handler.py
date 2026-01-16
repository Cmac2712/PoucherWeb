"""
Tags Lambda Handler

Endpoints:
    POST   /api/tags      - Create tag
    PUT    /api/tags/:id  - Update tag
    DELETE /api/tags/:id  - Delete tag
"""
import json
import re
import sys
import os
from uuid import UUID

# Add shared module to path for Lambda
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.db import get_session, User, Tag, Bookmark, BookmarkTag
from shared.utils import validate_token, success, error, bad_request, unauthorized, not_found
from shared.utils.auth import AuthError
from shared.utils.response import options_response


def handler(event, context):
    """Main Lambda handler - routes to appropriate function."""
    http_method = event.get("httpMethod", "")
    path = event.get("path", "")

    # Handle CORS preflight
    if http_method == "OPTIONS":
        return options_response()

    # Extract tag ID from path if present
    id_match = re.match(r"^/api/tags/([a-f0-9-]+)$", path)
    tag_id = id_match.group(1) if id_match else None

    # Route requests
    if path == "/api/tags" and http_method == "POST":
        return create(event, context)

    if tag_id:
        if http_method == "PUT":
            return update(event, context, tag_id)
        elif http_method == "DELETE":
            return delete(event, context, tag_id)

    return error("Not found", status=404)


def _get_user_by_cognito_sub(db, cognito_sub: str) -> User:
    """Get user by Cognito sub, returns None if not found."""
    return db.query(User).filter(User.cognito_sub == cognito_sub).first()


def create(event, context):
    """
    POST /api/tags

    Request body:
        {
            "title": "Tag name",
            "authorID": "user-id",  // Legacy, ignored - uses authenticated user
            "bookmarkID": "{\"list\": [\"id1\", \"id2\"]}"  // Legacy format, parsed
        }

    Response:
        { "tag": {...} }
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
    if not title:
        return bad_request("title is required")

    # Parse legacy bookmarkID format
    bookmark_ids = []
    bookmark_id_raw = body.get("bookmarkID", "")
    if bookmark_id_raw:
        try:
            if isinstance(bookmark_id_raw, str):
                parsed = json.loads(bookmark_id_raw)
                bookmark_ids = parsed.get("list", [])
            elif isinstance(bookmark_id_raw, dict):
                bookmark_ids = bookmark_id_raw.get("list", [])
        except json.JSONDecodeError:
            pass  # Invalid format, ignore

    try:
        with get_session() as db:
            user = _get_user_by_cognito_sub(db, token_user["sub"])
            if not user:
                return unauthorized("User not found")

            # Check for duplicate tag name
            existing = db.query(Tag).filter(
                Tag.author_id == user.id,
                Tag.title == title
            ).first()
            if existing:
                return bad_request(f"Tag '{title}' already exists")

            tag = Tag(
                author_id=user.id,
                title=title,
            )
            db.add(tag)
            db.flush()

            # Associate bookmarks
            for bid in bookmark_ids:
                try:
                    bookmark = db.query(Bookmark).filter(
                        Bookmark.id == UUID(bid),
                        Bookmark.author_id == user.id
                    ).first()
                    if bookmark:
                        bookmark_tag = BookmarkTag(
                            bookmark_id=bookmark.id,
                            tag_id=tag.id
                        )
                        db.add(bookmark_tag)
                except ValueError:
                    pass  # Invalid UUID

            return success({"tag": tag.to_dict()}, status=201)

    except Exception as e:
        return error(f"Database error: {str(e)}")


def update(event, context, tag_id: str):
    """
    PUT /api/tags/:id

    Request body:
        {
            "title": "Updated tag name",
            "bookmarkID": "{\"list\": [\"id1\"]}"  // Replace all bookmark associations
        }

    Response:
        { "tag": {...} }
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
        tag_uuid = UUID(tag_id)
    except ValueError:
        return bad_request("Invalid tag ID")

    try:
        with get_session() as db:
            user = _get_user_by_cognito_sub(db, token_user["sub"])
            if not user:
                return unauthorized("User not found")

            tag = db.query(Tag).filter(
                Tag.id == tag_uuid,
                Tag.author_id == user.id
            ).first()

            if not tag:
                return not_found("Tag not found")

            # Update title if provided
            if "title" in body:
                new_title = body["title"].strip()
                if new_title and new_title != tag.title:
                    # Check for duplicate
                    existing = db.query(Tag).filter(
                        Tag.author_id == user.id,
                        Tag.title == new_title,
                        Tag.id != tag.id
                    ).first()
                    if existing:
                        return bad_request(f"Tag '{new_title}' already exists")
                    tag.title = new_title

            # Update bookmark associations if provided
            bookmark_id_raw = body.get("bookmarkID")
            if bookmark_id_raw is not None:
                # Parse legacy format
                bookmark_ids = []
                try:
                    if isinstance(bookmark_id_raw, str):
                        parsed = json.loads(bookmark_id_raw)
                        bookmark_ids = parsed.get("list", [])
                    elif isinstance(bookmark_id_raw, dict):
                        bookmark_ids = bookmark_id_raw.get("list", [])
                except json.JSONDecodeError:
                    pass

                # Remove existing associations
                db.query(BookmarkTag).filter(BookmarkTag.tag_id == tag.id).delete()

                # Add new associations
                for bid in bookmark_ids:
                    try:
                        bookmark = db.query(Bookmark).filter(
                            Bookmark.id == UUID(bid),
                            Bookmark.author_id == user.id
                        ).first()
                        if bookmark:
                            bookmark_tag = BookmarkTag(
                                bookmark_id=bookmark.id,
                                tag_id=tag.id
                            )
                            db.add(bookmark_tag)
                    except ValueError:
                        pass

            return success({"tag": tag.to_dict()})

    except Exception as e:
        return error(f"Database error: {str(e)}")


def delete(event, context, tag_id: str):
    """
    DELETE /api/tags/:id

    Response:
        { "tag": {...} }  // The deleted tag
    """
    try:
        token_user = validate_token(event)
    except AuthError as e:
        return unauthorized(str(e))

    try:
        tag_uuid = UUID(tag_id)
    except ValueError:
        return bad_request("Invalid tag ID")

    try:
        with get_session() as db:
            user = _get_user_by_cognito_sub(db, token_user["sub"])
            if not user:
                return unauthorized("User not found")

            tag = db.query(Tag).filter(
                Tag.id == tag_uuid,
                Tag.author_id == user.id
            ).first()

            if not tag:
                return not_found("Tag not found")

            tag_data = tag.to_dict()
            db.delete(tag)  # Cascade deletes bookmark_tags entries

            return success({"tag": tag_data})

    except Exception as e:
        return error(f"Database error: {str(e)}")
