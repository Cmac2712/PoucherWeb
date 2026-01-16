import json
from typing import Any

# CORS headers for API Gateway
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Content-Type": "application/json",
}


def _response(status_code: int, body: Any) -> dict:
    """Build a Lambda response object."""
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, default=str),
    }


def success(data: dict, status: int = 200) -> dict:
    """Return a successful response."""
    return _response(status, data)


def error(message: str, status: int = 500) -> dict:
    """Return an error response."""
    return _response(status, {"error": message})


def bad_request(message: str = "Bad request") -> dict:
    """Return a 400 bad request response."""
    return _response(400, {"error": message})


def unauthorized(message: str = "Unauthorized") -> dict:
    """Return a 401 unauthorized response."""
    return _response(401, {"error": message})


def not_found(message: str = "Not found") -> dict:
    """Return a 404 not found response."""
    return _response(404, {"error": message})


def options_response() -> dict:
    """Return CORS preflight response."""
    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": "",
    }
