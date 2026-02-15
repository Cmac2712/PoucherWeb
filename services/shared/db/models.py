import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cognito_sub = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    picture_url = Column(Text, nullable=True)
    preferences = Column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    bookmarks = relationship("Bookmark", back_populates="author", cascade="all, delete-orphan")
    tags = relationship("Tag", back_populates="author", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "name": self.name,
            "picture": self.picture_url,
            "preferences": self.preferences or {},
        }


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(Text, nullable=False)
    video_url = Column(Text, nullable=True)
    screenshot_url = Column(Text, nullable=True)
    metadata_json = Column("metadata", JSONB, nullable=True)
    metadata_status = Column(String(32), nullable=False, default="ready")
    metadata_error = Column(Text, nullable=True)
    metadata_updated_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    author = relationship("User", back_populates="bookmarks")
    tags = relationship("Tag", secondary="bookmark_tags", back_populates="bookmarks")

    def to_dict(self, include_tags=False):
        data = {
            "id": str(self.id),
            "authorID": str(self.author_id),
            "title": self.title,
            "description": self.description or "",
            "url": self.url,
            "videoURL": self.video_url,
            "screenshotURL": self.screenshot_url,
            "metadata": self.metadata_json or {},
            "metadataStatus": self.metadata_status,
            "metadataError": self.metadata_error,
            "metadataUpdatedAt": self.metadata_updated_at.isoformat()
            if self.metadata_updated_at
            else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
        if include_tags:
            data["tags"] = [tag.to_dict() for tag in self.tags]
        return data


class Tag(Base):
    __tablename__ = "tags"
    __table_args__ = (
        UniqueConstraint("author_id", "title", name="uq_tag_author_title"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    author = relationship("User", back_populates="tags")
    bookmarks = relationship("Bookmark", secondary="bookmark_tags", back_populates="tags")

    def to_dict(self):
        """Convert to dict matching frontend Tag interface."""
        # Note: bookmarkID is kept for backwards compatibility with frontend
        # It contains a JSON string of bookmark IDs
        bookmark_ids = [str(b.id) for b in self.bookmarks]
        return {
            "ID": str(self.id),
            "title": self.title,
            "authorID": str(self.author_id),
            "bookmarkID": f'{{"list": {bookmark_ids}}}',  # Legacy format
        }


class BookmarkTag(Base):
    """Junction table for many-to-many bookmark-tag relationship."""
    __tablename__ = "bookmark_tags"

    bookmark_id = Column(
        UUID(as_uuid=True),
        ForeignKey("bookmarks.id", ondelete="CASCADE"),
        primary_key=True
    )
    tag_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True
    )
    created_at = Column(DateTime(timezone=True), default=utc_now)
