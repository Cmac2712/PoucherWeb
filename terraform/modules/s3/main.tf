# S3 Module
# Creates S3 bucket for screenshot storage

resource "aws_s3_bucket" "screenshots" {
  bucket = "${var.project_name}-screenshots-${var.environment}"

  tags = {
    Name = "${var.project_name}-screenshots"
  }
}

# Versioning
resource "aws_s3_bucket_versioning" "screenshots" {
  bucket = aws_s3_bucket.screenshots.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Disabled"
  }
}

# Server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "screenshots" {
  bucket = aws_s3_bucket.screenshots.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access (we'll use CloudFront or signed URLs)
resource "aws_s3_bucket_public_access_block" "screenshots" {
  bucket = aws_s3_bucket.screenshots.id

  block_public_acls       = !var.public_access
  block_public_policy     = !var.public_access
  ignore_public_acls      = !var.public_access
  restrict_public_buckets = !var.public_access
}

# Bucket policy for public read (if enabled)
resource "aws_s3_bucket_policy" "screenshots" {
  count  = var.public_access ? 1 : 0
  bucket = aws_s3_bucket.screenshots.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.screenshots.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.screenshots]
}

# Lifecycle rules
resource "aws_s3_bucket_lifecycle_configuration" "screenshots" {
  bucket = aws_s3_bucket.screenshots.id

  rule {
    id     = "transition-to-infrequent-access"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

# CORS configuration (for direct browser uploads if needed)
resource "aws_s3_bucket_cors_configuration" "screenshots" {
  bucket = aws_s3_bucket.screenshots.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = var.cors_allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }
}
