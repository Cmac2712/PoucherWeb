import os
import json
import time
import urllib.request
from functools import lru_cache
from jose import jwt, JWTError

COGNITO_REGION = os.environ.get("COGNITO_REGION", "eu-west-2")
COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID")
COGNITO_CLIENT_ID = os.environ.get("COGNITO_CLIENT_ID")


class AuthError(Exception):
    """Authentication error."""
    pass


@lru_cache(maxsize=1)
def get_jwks():
    """Fetch and cache JWKS from Cognito."""
    if not COGNITO_USER_POOL_ID:
        raise AuthError("COGNITO_USER_POOL_ID not configured")

    jwks_url = (
        f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/"
        f"{COGNITO_USER_POOL_ID}/.well-known/jwks.json"
    )

    with urllib.request.urlopen(jwks_url) as response:
        return json.loads(response.read().decode())


def get_user_from_token(token: str) -> dict:
    """
    Validate a Cognito JWT and extract user info.

    Returns:
        dict with keys: sub, email, name, picture (optional)

    Raises:
        AuthError if token is invalid
    """
    try:
        # Get the key ID from the token header
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        # Find the matching key in JWKS
        jwks = get_jwks()
        key = None
        for k in jwks.get("keys", []):
            if k.get("kid") == kid:
                key = k
                break

        if not key:
            raise AuthError("Unable to find matching key")

        # Verify and decode the token
        issuer = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=COGNITO_CLIENT_ID,
            issuer=issuer,
        )

        # Check expiration
        if payload.get("exp", 0) < time.time():
            raise AuthError("Token has expired")

        return {
            "sub": payload.get("sub"),
            "email": payload.get("email"),
            "name": payload.get("name", payload.get("email", "").split("@")[0]),
            "picture": payload.get("picture"),
        }

    except JWTError as e:
        raise AuthError(f"Invalid token: {str(e)}")


def validate_token(event: dict) -> dict:
    """
    Extract and validate the Bearer token from Lambda event headers.

    Args:
        event: Lambda event dict

    Returns:
        User dict from token

    Raises:
        AuthError if no token or invalid token
    """
    headers = event.get("headers", {}) or {}

    # Headers can be lowercase or mixed case depending on API Gateway config
    auth_header = headers.get("Authorization") or headers.get("authorization")

    if not auth_header:
        raise AuthError("No authorization header")

    if not auth_header.startswith("Bearer "):
        raise AuthError("Invalid authorization header format")

    token = auth_header[7:]  # Remove "Bearer " prefix
    return get_user_from_token(token)
