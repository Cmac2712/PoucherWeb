# Production Environment
# Ties together all modules to deploy the complete infrastructure

# Data sources for secrets
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = module.rds.db_password_secret_arn
}

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "prod"
      ManagedBy   = "terraform"
    }
  }
}

# VPC
module "vpc" {
  source = "../../modules/vpc"

  project_name       = var.project_name
  vpc_cidr           = var.vpc_cidr
  az_count           = 2
  enable_nat_gateway = true
  enable_ssm_endpoints = true
}

# RDS
module "rds" {
  source = "../../modules/rds"

  project_name            = var.project_name
  vpc_id                  = module.vpc.vpc_id
  vpc_cidr                = module.vpc.vpc_cidr
  subnet_ids              = module.vpc.private_subnet_ids
  allowed_security_groups = [module.lambda.security_group_id, module.ssm_bastion.security_group_id]

  instance_class              = var.db_instance_class
  allocated_storage           = var.db_allocated_storage
  backup_retention_period     = 7
  deletion_protection         = var.db_deletion_protection
  skip_final_snapshot         = !var.db_deletion_protection
  publicly_accessible         = false
  performance_insights_enabled = false
}

# Cognito
module "cognito" {
  source = "../../modules/cognito"

  project_name   = var.project_name
  callback_urls  = var.cognito_callback_urls
  logout_urls    = var.cognito_logout_urls
  cognito_domain = var.cognito_domain
}

# S3 (Screenshots)
module "s3" {
  source = "../../modules/s3"

  project_name         = var.project_name
  environment          = "prod"
  public_access        = true
  cors_allowed_origins = var.cors_allowed_origins
}

# Lambda
module "lambda" {
  source = "../../modules/lambda"

  project_name            = var.project_name
  vpc_id                  = module.vpc.vpc_id
  subnet_ids              = module.vpc.private_subnet_ids
  database_url            = "postgresql://${module.rds.db_username}:${jsondecode(data.aws_secretsmanager_secret_version.db_password.secret_string).password}@${module.rds.db_endpoint}/${module.rds.db_name}?sslmode=require"
  db_secret_arn           = module.rds.db_password_secret_arn
  cognito_user_pool_id    = module.cognito.user_pool_id
  cognito_client_id       = module.cognito.client_id
  screenshots_bucket_name = module.s3.bucket_id
  screenshots_bucket_arn  = module.s3.bucket_arn
  lambda_package_path     = var.lambda_package_path
  log_retention_days      = 14
}

# SSM Bastion (for private DB access via Session Manager)
module "ssm_bastion" {
  source = "../../modules/ssm-bastion"

  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
  subnet_ids   = module.vpc.private_subnet_ids
  s3_bucket_arn = module.s3.bucket_arn
}

# API Gateway
module "api_gateway" {
  source = "../../modules/api-gateway"

  project_name          = var.project_name
  stage_name            = "$default"
  lambda_invoke_arns    = module.lambda.function_invoke_arns
  lambda_function_names = module.lambda.function_names
  cors_allow_origins    = var.cors_allowed_origins
  log_retention_days    = 14
}
