"""
Users Lambda Handler

Endpoints:
    PUT /api/users/:id - Update user profile
"""
import json
import re
import sys
import os
from uuid import UUID

# Add shared module to path for Lambda
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.db import get_session, User
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

    # Extract user ID from path
    id_match = re.match(r"^/api/users/([a-f0-9-]+)$", path)
    user_id = id_match.group(1) if id_match else None

    if user_id and http_method == "PUT":
        return update(event, context, user_id)

    return error("Not found", status=404)


def update(event, context, user_id: str):
    """
    PUT /api/users/:id

    Request body:
        {
            "name": "New Name",
            "picture": "https://example.com/avatar.jpg"
        }

    Response:
        { "user": {...} }
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
        user_uuid = UUID(user_id)
    except ValueError:
        return bad_request("Invalid user ID")

    try:
        with get_session() as db:
            # Get authenticated user
            auth_user = db.query(User).filter(
                User.cognito_sub == token_user["sub"]
            ).first()

            if not auth_user:
                return unauthorized("User not found")

            # Security: Users can only update their own profile
            if auth_user.id != user_uuid:
                return unauthorized("Cannot update another user's profile")

            # Update allowed fields
            if "name" in body:
                auth_user.name = body["name"].strip()

            if "picture" in body:
                auth_user.picture_url = body["picture"]

            return success({"user": auth_user.to_dict()})

    except Exception as e:
        return error(f"Database error: {str(e)}")
