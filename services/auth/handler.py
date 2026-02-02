"""
Auth Lambda Handler

Endpoints:
    POST /api/auth/init - Initialize user session, create user if needed, return user + tags
"""
import json
import sys
import os

# Add shared module to path for Lambda
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.db import get_session, User, Tag
from shared.utils import validate_token, success, error, bad_request, unauthorized, AuthError
from shared.utils.response import options_response


def handler(event, context):
    """Main Lambda handler - routes to appropriate function."""
    # Support both API Gateway REST API (v1) and HTTP API (v2) formats
    if "httpMethod" in event:
        # v1 format (REST API)
        http_method = event.get("httpMethod", "")
        path = event.get("path", "")
    else:
        # v2 format (HTTP API)
        request_context = event.get("requestContext", {})
        http_info = request_context.get("http", {})
        http_method = http_info.get("method", "")
        path = event.get("rawPath", "")
    
    # Debug logging
    print(f"DEBUG: method={http_method}, path={path}")

    # Handle CORS preflight
    if http_method == "OPTIONS":
        return options_response()

    # Route requests (handle both with and without stage prefix)
    if http_method == "POST" and path.endswith("/api/auth/init"):
        return init(event, context)

    return error("Not found", status=404)


def init(event, context):
    """
    POST /api/auth/init

    Initialize user session. Creates user if they don't exist.
    Returns user data and their tags.

    Request body:
        {
            "id": "cognito-sub",
            "email": "user@example.com",
            "name": "User Name"
        }

    Response:
        {
            "user": { "id": "...", "email": "...", "name": "..." },
            "tags": [{ "ID": "...", "title": "...", ... }]
        }
    """
    try:
        # Validate token
        token_user = validate_token(event)
    except AuthError as e:
        return unauthorized(str(e))

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return bad_request("Invalid JSON body")

    cognito_sub = body.get("id") or token_user.get("sub")
    email = body.get("email") or token_user.get("email")
    name = body.get("name") or token_user.get("name")

    if not cognito_sub or not email:
        return bad_request("Missing required fields: id, email")

    try:
        with get_session() as db:
            # Find or create user
            user = db.query(User).filter(User.cognito_sub == cognito_sub).first()

            if user:
                # Update user info if changed
                if user.email != email or user.name != name:
                    user.email = email
                    user.name = name
            else:
                # Create new user
                user = User(
                    cognito_sub=cognito_sub,
                    email=email,
                    name=name,
                    picture_url=token_user.get("picture"),
                )
                db.add(user)
                db.flush()  # Get the user ID

            # Fetch user's tags
            tags = db.query(Tag).filter(Tag.author_id == user.id).all()

            return success({
                "user": user.to_dict(),
                "tags": [tag.to_dict() for tag in tags],
            })

    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
        return error(f"Database error: {str(e)}")
