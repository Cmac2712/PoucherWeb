# Production Environment Configuration

aws_region   = "eu-west-1"
project_name = "poucher"

# VPC
vpc_cidr = "10.0.0.0/16"

# RDS
db_instance_class      = "db.t3.micro"
db_allocated_storage   = 20
db_deletion_protection = true

# Cognito - Update these with your production URLs
cognito_callback_urls = [
  "http://localhost:5173/callback",
  "http://localhost:3000/callback"
  # Add production URL: "https://yourdomain.com/callback"
]

cognito_logout_urls = [
  "http://localhost:5173",
  "http://localhost:3000"
  # Add production URL: "https://yourdomain.com"
]

# Lambda
lambda_package_path = "../../../services/lambda.zip"

# CORS - Update with production domain
cors_allowed_origins = [
  "*"
  # For production, restrict to: "https://yourdomain.com"
]
