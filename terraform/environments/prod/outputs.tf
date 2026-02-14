output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = module.api_gateway.stage_invoke_url
}

output "api_endpoints" {
  description = "Individual API endpoint URLs"
  value       = module.api_gateway.api_endpoints
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
}

output "cognito_client_id" {
  description = "Cognito App Client ID"
  value       = module.cognito.client_id
}

output "cognito_domain" {
  description = "Cognito domain URL"
  value       = module.cognito.cognito_domain_url
}

output "db_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_endpoint
}

output "rds_security_group_id" {
  description = "RDS security group ID"
  value       = module.rds.security_group_id
}

output "db_secret_arn" {
  description = "ARN of the database credentials secret"
  value       = module.rds.db_password_secret_arn
}

output "ses_sender_email_arn" {
  description = "ARN of the SES verified email identity"
  value       = module.ses.sender_email_arn
}

output "ses_send_policy_arn" {
  description = "ARN of the IAM policy for sending SES emails"
  value       = module.ses.ses_send_policy_arn
}

output "screenshots_bucket" {
  description = "Screenshots S3 bucket name"
  value       = module.s3.bucket_id
}

output "screenshots_bucket_url" {
  description = "Screenshots S3 bucket URL"
  value       = module.s3.bucket_url
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "ssm_bastion_instance_id" {
  description = "SSM bastion instance ID"
  value       = module.ssm_bastion.instance_id
}

output "lambda_functions" {
  description = "Lambda function names"
  value       = module.lambda.function_names
}

output "frontend_env_vars" {
  description = "Environment variables for frontend .env file"
  value       = <<-EOT
    VITE_SERVER_ENDPOINT=${module.api_gateway.stage_invoke_url}
    VITE_AUTH0_DOMAIN=${module.cognito.cognito_domain_url}
    VITE_AUTH0_CLIENT_ID=${module.cognito.client_id}
    VITE_COGNITO_USER_POOL_ID=${module.cognito.user_pool_id}
    VITE_COGNITO_REGION=${var.aws_region}
  EOT
}
