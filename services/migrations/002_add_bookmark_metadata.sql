-- Add metadata tracking for bookmarks
ALTER TABLE bookmarks
  ADD COLUMN metadata JSONB,
  ADD COLUMN metadata_status VARCHAR(32) NOT NULL DEFAULT 'ready',
  ADD COLUMN metadata_error TEXT,
  ADD COLUMN metadata_updated_at TIMESTAMPTZ;

-- Optional: index for status filtering
CREATE INDEX IF NOT EXISTS idx_bookmarks_metadata_status
  ON bookmarks (metadata_status);
