"""
Screenshot Lambda Handler

This is an async worker that captures screenshots of bookmark URLs.
Typically triggered by SQS/SNS when a bookmark is created.

Endpoints:
    POST /api/screenshot - Capture screenshot for a bookmark (internal use)

SQS Event:
    {
        "bookmarkId": "uuid",
        "url": "https://example.com"
    }
"""
import json
import os
import sys
import boto3
import urllib.request
from uuid import UUID
from io import BytesIO

# Add shared module to path for Lambda
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.db import get_session, Bookmark
from shared.utils import success, error, bad_request
from shared.utils.response import options_response

# S3 configuration
S3_BUCKET = os.environ.get("SCREENSHOT_BUCKET", "poucher-screenshots")
S3_REGION = os.environ.get("AWS_REGION", "eu-west-2")

# Initialize S3 client
s3_client = boto3.client("s3", region_name=S3_REGION)


def handler(event, context):
    """
    Main Lambda handler.

    Supports both HTTP (API Gateway) and SQS triggers.
    """
    # Check if this is an SQS event
    if "Records" in event:
        return handle_sqs_event(event, context)

    # HTTP event
    http_method = event.get("httpMethod", "")

    if http_method == "OPTIONS":
        return options_response()

    if http_method == "POST":
        return capture_screenshot(event, context)

    return error("Not found", status=404)


def handle_sqs_event(event, context):
    """Process SQS messages for screenshot capture."""
    results = []

    for record in event.get("Records", []):
        try:
            body = json.loads(record.get("body", "{}"))
            bookmark_id = body.get("bookmarkId")
            url = body.get("url")

            if bookmark_id and url:
                result = process_screenshot(bookmark_id, url)
                results.append({"bookmarkId": bookmark_id, "success": result})
            else:
                results.append({"error": "Missing bookmarkId or url"})

        except Exception as e:
            results.append({"error": str(e)})

    return {"processed": len(results), "results": results}


def capture_screenshot(event, context):
    """
    POST /api/screenshot

    Request body:
        {
            "bookmarkId": "uuid",
            "url": "https://example.com"
        }

    Response:
        { "screenshotUrl": "https://s3..." }
    """
    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return bad_request("Invalid JSON body")

    bookmark_id = body.get("bookmarkId")
    url = body.get("url")

    if not bookmark_id or not url:
        return bad_request("bookmarkId and url are required")

    try:
        screenshot_url = process_screenshot(bookmark_id, url)
        if screenshot_url:
            return success({"screenshotUrl": screenshot_url})
        else:
            return error("Failed to capture screenshot")
    except Exception as e:
        return error(f"Screenshot error: {str(e)}")


def process_screenshot(bookmark_id: str, url: str) -> str | None:
    """
    Capture screenshot and upload to S3.

    For Lambda deployment, you'll need to use a headless browser layer.
    Options:
    1. playwright with playwright-aws-lambda
    2. puppeteer with chrome-aws-lambda
    3. External screenshot API service

    This implementation uses a placeholder that you can swap out.
    """
    try:
        bookmark_uuid = UUID(bookmark_id)
    except ValueError:
        return None

    # Option 1: Use external screenshot API (simpler for Lambda)
    screenshot_url = capture_with_external_api(url, str(bookmark_uuid))

    # Option 2: Use Playwright (requires Lambda layer)
    # screenshot_url = capture_with_playwright(url, str(bookmark_uuid))

    if screenshot_url:
        # Update bookmark with screenshot URL
        update_bookmark_screenshot(bookmark_uuid, screenshot_url)

    return screenshot_url


def capture_with_external_api(url: str, bookmark_id: str) -> str | None:
    """
    Capture screenshot using external API service.

    Popular options:
    - screenshotapi.net
    - urlbox.io
    - screenshot.guru

    This is a placeholder - implement with your chosen service.
    """
    # Example using a hypothetical screenshot API
    api_key = os.environ.get("SCREENSHOT_API_KEY")
    if not api_key:
        # Fallback: return None, screenshot will be captured later
        return None

    # This is a placeholder implementation
    # Replace with actual API call to your screenshot service
    try:
        # Example API call structure:
        # api_url = f"https://api.screenshotservice.com/capture?url={url}&key={api_key}"
        # response = urllib.request.urlopen(api_url)
        # screenshot_data = response.read()

        # Upload to S3
        # s3_key = f"screenshots/{bookmark_id}.png"
        # s3_client.put_object(
        #     Bucket=S3_BUCKET,
        #     Key=s3_key,
        #     Body=screenshot_data,
        #     ContentType="image/png"
        # )

        # return f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{s3_key}"
        return None

    except Exception:
        return None


def capture_with_playwright(url: str, bookmark_id: str) -> str | None:
    """
    Capture screenshot using Playwright.

    Requires playwright-aws-lambda layer for Lambda deployment.

    To use this:
    1. Add playwright to requirements.txt
    2. Deploy with playwright-aws-lambda layer
    3. Uncomment this function in process_screenshot()
    """
    try:
        # This import will fail without the Lambda layer
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(
                args=[
                    "--disable-gpu",
                    "--single-process",
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                ]
            )
            page = browser.new_page(viewport={"width": 1280, "height": 720})

            # Navigate and wait for network idle
            page.goto(url, wait_until="networkidle", timeout=30000)

            # Capture screenshot
            screenshot_bytes = page.screenshot(type="png")
            browser.close()

            # Upload to S3
            s3_key = f"screenshots/{bookmark_id}.png"
            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=s3_key,
                Body=screenshot_bytes,
                ContentType="image/png",
                CacheControl="max-age=31536000",  # Cache for 1 year
            )

            return f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{s3_key}"

    except ImportError:
        # Playwright not available
        return None
    except Exception:
        return None


def update_bookmark_screenshot(bookmark_id: UUID, screenshot_url: str):
    """Update bookmark with captured screenshot URL."""
    try:
        with get_session() as db:
            bookmark = db.query(Bookmark).filter(Bookmark.id == bookmark_id).first()
            if bookmark:
                bookmark.screenshot_url = screenshot_url
    except Exception:
        pass  # Non-critical, log error in production
