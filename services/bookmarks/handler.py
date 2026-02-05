"""
Bookmarks Lambda Handler

Endpoints:
    GET    /api/bookmarks      - Search/list bookmarks
    POST   /api/bookmarks      - Create bookmark
    PUT    /api/bookmarks/:id  - Update bookmark
    DELETE /api/bookmarks/:id  - Delete bookmark
"""
import json
import re
import sys
import os
import boto3
from uuid import UUID

# Add shared module to path for Lambda
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.db import get_session, User, Bookmark, Tag, BookmarkTag
from shared.utils import validate_token, success, error, bad_request, unauthorized, not_found
from shared.utils.auth import AuthError
from shared.utils.response import options_response


SQS_METADATA_QUEUE_URL = os.environ.get("METADATA_QUEUE_URL")
_sqs_client = boto3.client("sqs") if SQS_METADATA_QUEUE_URL else None


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

    # Extract bookmark ID from path if present
    # Matches /api/bookmarks/{id}
    id_match = re.match(r"^/api/bookmarks/([a-f0-9-]+)$", path)
    bookmark_id = id_match.group(1) if id_match else None

    # Route requests
    if path == "/api/bookmarks":
        if http_method == "GET":
            return search(event, context)
        elif http_method == "POST":
            return create(event, context)

    if bookmark_id:
        if http_method == "PUT":
            return update(event, context, bookmark_id)
        elif http_method == "DELETE":
            return delete(event, context, bookmark_id)

    return error("Not found", status=404)


def _get_user_by_cognito_sub(db, cognito_sub: str) -> User:
    """Get user by Cognito sub, returns None if not found."""
    return db.query(User).filter(User.cognito_sub == cognito_sub).first()


def search(event, context):
    """
    GET /api/bookmarks

    Query params:
        authorID    - Filter by author (required for security)
        title       - Search title (partial match)
        description - Search description (partial match)
        offset      - Pagination offset (default: 0)
        limit       - Pagination limit (default: 15)
        ids         - Comma-separated bookmark IDs to fetch

    Response:
        {
            "bookmarks": [...],
            "count": 123
        }
    """
    try:
        token_user = validate_token(event)
    except AuthError as e:
        return unauthorized(str(e))

    params = event.get("queryStringParameters", {}) or {}

    offset = int(params.get("offset", 0))
    limit = min(int(params.get("limit", 15)), 100)  # Cap at 100
    title_search = params.get("title", "")
    description_search = params.get("description", "")
    ids_param = params.get("ids", "")

    try:
        with get_session() as db:
            # Get the authenticated user
            user = _get_user_by_cognito_sub(db, token_user["sub"])
            if not user:
                return unauthorized("User not found")

            # Build query - always filter by authenticated user for security
            query = db.query(Bookmark).filter(Bookmark.author_id == user.id)

            # Filter by specific IDs if provided
            if ids_param:
                try:
                    id_list = [UUID(id.strip()) for id in ids_param.split(",") if id.strip()]
                    query = query.filter(Bookmark.id.in_(id_list))
                except ValueError:
                    return bad_request("Invalid bookmark ID format")

            # Search filters
            if title_search:
                query = query.filter(Bookmark.title.ilike(f"%{title_search}%"))

            if description_search:
                query = query.filter(Bookmark.description.ilike(f"%{description_search}%"))

            # Get total count before pagination
            total_count = query.count()

            # Apply pagination and ordering
            bookmarks = (
                query
                .order_by(Bookmark.created_at.desc())
                .offset(offset)
                .limit(limit)
                .all()
            )

            return success({
                "bookmarks": [b.to_dict() for b in bookmarks],
                "count": total_count,
            })

    except Exception as e:
        return error(f"Database error: {str(e)}")


def create(event, context):
    """
    POST /api/bookmarks

    Request body:
        {
            "title": "Bookmark title",
            "url": "https://example.com",
            "description": "Optional description",
            "videoURL": "Optional video URL",
            "tagIds": ["tag-id-1", "tag-id-2"]  // Optional
        }

    Response:
        { "bookmark": {...} }
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
    url = body.get("url", "").strip()

    if not url:
        return bad_request("url is required")

    if not title:
        title = url

    try:
        bookmark_id = None
        bookmark_url = None
        with get_session() as db:
            user = _get_user_by_cognito_sub(db, token_user["sub"])
            if not user:
                return unauthorized("User not found")

            bookmark = Bookmark(
                author_id=user.id,
                title=title,
                url=url,
                description=body.get("description", ""),
                video_url=body.get("videoURL"),
                metadata_status="pending",
            )
            db.add(bookmark)
            db.flush()  # Get the bookmark ID
            bookmark_id = str(bookmark.id)
            bookmark_url = bookmark.url

            # Associate with tags if provided
            tag_ids = body.get("tagIds", [])
            if tag_ids:
                for tag_id in tag_ids:
                    try:
                        tag = db.query(Tag).filter(
                            Tag.id == UUID(tag_id),
                            Tag.author_id == user.id  # Security: only user's tags
                        ).first()
                        if tag:
                            bookmark_tag = BookmarkTag(
                                bookmark_id=bookmark.id,
                                tag_id=tag.id
                            )
                            db.add(bookmark_tag)
                    except ValueError:
                        pass  # Invalid UUID, skip

            response = success({"bookmark": bookmark.to_dict()}, status=201)

        if _sqs_client and bookmark_id and bookmark_url:
            try:
                _sqs_client.send_message(
                    QueueUrl=SQS_METADATA_QUEUE_URL,
                    MessageBody=json.dumps({
                        "bookmarkId": bookmark_id,
                        "url": bookmark_url,
                    })
                )
            except Exception:
                pass

        return response

    except Exception as e:
        return error(f"Database error: {str(e)}")


def update(event, context, bookmark_id: str):
    """
    PUT /api/bookmarks/:id

    Request body:
        {
            "title": "Updated title",
            "url": "https://example.com",
            "description": "Updated description",
            "videoURL": "Updated video URL",
            "tagIds": ["tag-id-1"]  // Replace all tags
        }

    Response:
        { "bookmark": {...} }
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
        bookmark_uuid = UUID(bookmark_id)
    except ValueError:
        return bad_request("Invalid bookmark ID")

    try:
        with get_session() as db:
            user = _get_user_by_cognito_sub(db, token_user["sub"])
            if not user:
                return unauthorized("User not found")

            # Find bookmark - must belong to authenticated user
            bookmark = db.query(Bookmark).filter(
                Bookmark.id == bookmark_uuid,
                Bookmark.author_id == user.id
            ).first()

            if not bookmark:
                return not_found("Bookmark not found")

            # Update fields if provided
            if "title" in body:
                bookmark.title = body["title"].strip()
            if "url" in body:
                bookmark.url = body["url"].strip()
            if "description" in body:
                bookmark.description = body["description"]
            if "videoURL" in body:
                bookmark.video_url = body["videoURL"]
            if "screenshotURL" in body:
                bookmark.screenshot_url = body["screenshotURL"]

            # Update tags if provided
            if "tagIds" in body:
                # Remove existing tags
                db.query(BookmarkTag).filter(
                    BookmarkTag.bookmark_id == bookmark.id
                ).delete()

                # Add new tags
                for tag_id in body["tagIds"]:
                    try:
                        tag = db.query(Tag).filter(
                            Tag.id == UUID(tag_id),
                            Tag.author_id == user.id
                        ).first()
                        if tag:
                            bookmark_tag = BookmarkTag(
                                bookmark_id=bookmark.id,
                                tag_id=tag.id
                            )
                            db.add(bookmark_tag)
                    except ValueError:
                        pass

            return success({"bookmark": bookmark.to_dict()})

    except Exception as e:
        return error(f"Database error: {str(e)}")


def delete(event, context, bookmark_id: str):
    """
    DELETE /api/bookmarks/:id

    Response:
        { "bookmark": {...} }  // The deleted bookmark
    """
    try:
        token_user = validate_token(event)
    except AuthError as e:
        return unauthorized(str(e))

    try:
        bookmark_uuid = UUID(bookmark_id)
    except ValueError:
        return bad_request("Invalid bookmark ID")

    try:
        with get_session() as db:
            user = _get_user_by_cognito_sub(db, token_user["sub"])
            if not user:
                return unauthorized("User not found")

            bookmark = db.query(Bookmark).filter(
                Bookmark.id == bookmark_uuid,
                Bookmark.author_id == user.id
            ).first()

            if not bookmark:
                return not_found("Bookmark not found")

            bookmark_data = bookmark.to_dict()
            db.delete(bookmark)

            return success({"bookmark": bookmark_data})

    except Exception as e:
        return error(f"Database error: {str(e)}")
