output "bucket_id" {
  description = "ID of the S3 bucket"
  value       = aws_s3_bucket.screenshots.id
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.screenshots.arn
}

output "bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.screenshots.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  value       = aws_s3_bucket.screenshots.bucket_regional_domain_name
}

output "bucket_url" {
  description = "URL for accessing bucket objects"
  value       = "https://${aws_s3_bucket.screenshots.bucket_regional_domain_name}"
}
