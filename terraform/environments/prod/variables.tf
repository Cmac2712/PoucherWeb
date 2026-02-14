variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "poucher"
}

# VPC
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# RDS
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20
}

variable "db_deletion_protection" {
  description = "Enable deletion protection for RDS"
  type        = bool
  default     = true
}

# Cognito
variable "cognito_callback_urls" {
  description = "OAuth callback URLs"
  type        = list(string)
  default     = ["http://localhost:5173/callback", "http://localhost:3000/callback"]
}

variable "cognito_logout_urls" {
  description = "Logout URLs"
  type        = list(string)
  default     = ["http://localhost:5173", "http://localhost:3000"]
}

variable "cognito_domain" {
  description = "Custom Cognito domain prefix"
  type        = string
  default     = ""
}

# SES
variable "ses_sender_email" {
  description = "Email address for sending E2E test reports (must be verified in SES)"
  type        = string
  default     = "craig@craigmacintyre.co.uk"
}

# Lambda
variable "lambda_package_path" {
  description = "Path to Lambda deployment package"
  type        = string
  default     = "../../../services/lambda.zip"
}

# CORS
variable "cors_allowed_origins" {
  description = "Allowed origins for CORS"
  type        = list(string)
  default     = ["*"]
}
