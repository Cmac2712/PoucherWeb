"""
Bookmark Metadata Worker

Triggered by SQS with messages:
{
    "bookmarkId": "uuid",
    "url": "https://example.com"
}
"""
import json
import os
import sys
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from typing import Any
from urllib.parse import urljoin
from uuid import UUID

# Add shared module to path for Lambda
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.db import get_session, Bookmark


FETCH_TIMEOUT_SECONDS = int(os.environ.get("METADATA_FETCH_TIMEOUT_SECONDS", "10"))
MAX_BYTES = int(os.environ.get("METADATA_MAX_BYTES", "1048576"))
MAX_ATTEMPTS = int(os.environ.get("METADATA_MAX_ATTEMPTS", "3"))


class MetadataParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_title = False
        self.title_parts: list[str] = []
        self.meta: dict[str, str] = {}
        self.links: dict[str, str] = {}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {k.lower(): (v or "") for k, v in attrs}

        if tag == "title":
            self.in_title = True
            return

        if tag == "meta":
            key = attrs_dict.get("property") or attrs_dict.get("name")
            content = attrs_dict.get("content", "")
            if key and content and key.lower() not in self.meta:
                self.meta[key.lower()] = content.strip()
            return

        if tag == "link":
            rel = attrs_dict.get("rel", "").lower()
            href = attrs_dict.get("href", "")
            if not rel or not href:
                return
            if "icon" in rel and "icon" not in self.links:
                self.links["icon"] = href.strip()
            if "canonical" in rel and "canonical" not in self.links:
                self.links["canonical"] = href.strip()

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data.strip())

    def get_title(self) -> str | None:
        title = " ".join([part for part in self.title_parts if part])
        return title.strip() if title else None


def handler(event, context):
    if "Records" not in event:
        return {"error": "SQS event expected"}

    results = []
    for record in event.get("Records", []):
        try:
            body = json.loads(record.get("body", "{}"))
            bookmark_id = body.get("bookmarkId")
            url = body.get("url")
            attempts = int(record.get("attributes", {}).get("ApproximateReceiveCount", "1"))

            if not bookmark_id or not url:
                results.append({"error": "Missing bookmarkId or url"})
                continue

            process_metadata(bookmark_id, url, attempts)
            results.append({"bookmarkId": bookmark_id, "success": True})
        except Exception as e:
            results.append({"error": str(e)})
            raise

    return {"processed": len(results), "results": results}


def process_metadata(bookmark_id: str, url: str, attempts: int) -> None:
    try:
        bookmark_uuid = UUID(bookmark_id)
    except ValueError:
        return

    try:
        metadata = fetch_metadata(url)
        if metadata:
            update_bookmark_metadata(bookmark_uuid, url, metadata)
            return
        raise RuntimeError("No metadata extracted")
    except Exception as exc:
        if attempts >= MAX_ATTEMPTS:
            mark_metadata_failed(bookmark_uuid, str(exc))
        raise


def fetch_metadata(url: str) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "PoucherMetadataBot/1.0 (+https://poucher.app)",
            "Accept": "text/html,application/xhtml+xml",
        },
    )

    with urllib.request.urlopen(request, timeout=FETCH_TIMEOUT_SECONDS) as response:
        content_type = response.headers.get("Content-Type", "")
        if "text/html" not in content_type:
            return {}
        charset = response.headers.get_content_charset() or "utf-8"
        html = response.read(MAX_BYTES).decode(charset, errors="replace")

    parser = MetadataParser()
    parser.feed(html)

    og_title = parser.meta.get("og:title")
    og_description = parser.meta.get("og:description")
    og_image = parser.meta.get("og:image")
    og_site_name = parser.meta.get("og:site_name")
    og_url = parser.meta.get("og:url")

    title = og_title or parser.get_title()
    description = og_description or parser.meta.get("description")
    canonical = parser.links.get("canonical") or og_url
    favicon = parser.links.get("icon")

    if favicon:
        favicon = urljoin(url, favicon)
    if og_image:
        og_image = urljoin(url, og_image)
    if canonical:
        canonical = urljoin(url, canonical)

    return {
        "title": title,
        "description": description,
        "image": og_image,
        "siteName": og_site_name,
        "canonicalUrl": canonical,
        "ogUrl": og_url,
        "favicon": favicon,
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
    }


def update_bookmark_metadata(bookmark_id: UUID, url: str, metadata: dict[str, Any]) -> None:
    with get_session() as db:
        bookmark = db.query(Bookmark).filter(Bookmark.id == bookmark_id).first()
        if not bookmark:
            return

        title = metadata.get("title")
        description = metadata.get("description")

        if title and (not bookmark.title or bookmark.title == url):
            bookmark.title = title

        if description and not bookmark.description:
            bookmark.description = description

        bookmark.metadata_json = metadata
        bookmark.metadata_status = "ready"
        bookmark.metadata_error = None
        bookmark.metadata_updated_at = datetime.now(timezone.utc)


def mark_metadata_failed(bookmark_id: UUID, message: str) -> None:
    with get_session() as db:
        bookmark = db.query(Bookmark).filter(Bookmark.id == bookmark_id).first()
        if not bookmark:
            return
        bookmark.metadata_status = "failed"
        bookmark.metadata_error = message[:500]
        bookmark.metadata_updated_at = datetime.now(timezone.utc)
