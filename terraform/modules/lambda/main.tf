# Lambda Module
# Creates Lambda functions for all API services

data "aws_region" "current" {}

# IAM Role for Lambda functions
resource "aws_iam_role" "lambda" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# VPC execution policy (for RDS access)
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Custom policy for S3, Secrets Manager, SQS
resource "aws_iam_role_policy" "lambda_custom" {
  name = "${var.project_name}-lambda-custom-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "${var.screenshots_bucket_arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = var.db_secret_arn
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.screenshot.arn
      }
    ]
  })
}

# Security Group for Lambda
resource "aws_security_group" "lambda" {
  name        = "${var.project_name}-lambda-sg"
  description = "Security group for Lambda functions"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-lambda-sg"
  }
}

# SQS Queue for Screenshot processing
resource "aws_sqs_queue" "screenshot" {
  name                       = "${var.project_name}-screenshot-queue"
  visibility_timeout_seconds = 300
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10

  tags = {
    Name = "${var.project_name}-screenshot-queue"
  }
}

# Common environment variables
locals {
  common_environment = {
    DATABASE_URL         = var.database_url
    COGNITO_REGION       = data.aws_region.current.name
    COGNITO_USER_POOL_ID = var.cognito_user_pool_id
    COGNITO_CLIENT_ID    = var.cognito_client_id
    SCREENSHOT_BUCKET    = var.screenshots_bucket_name
    AWS_REGION_NAME      = data.aws_region.current.name
  }

  lambda_functions = {
    auth = {
      handler     = "auth.handler.handler"
      description = "Authentication and user initialization"
      timeout     = 30
      memory      = 256
    }
    bookmarks = {
      handler     = "bookmarks.handler.handler"
      description = "Bookmarks CRUD operations"
      timeout     = 30
      memory      = 256
    }
    tags = {
      handler     = "tags.handler.handler"
      description = "Tags CRUD operations"
      timeout     = 30
      memory      = 256
    }
    users = {
      handler     = "users.handler.handler"
      description = "User profile management"
      timeout     = 30
      memory      = 256
    }
    screenshot = {
      handler     = "screenshot.handler.handler"
      description = "Screenshot capture service"
      timeout     = 60
      memory      = 512
    }
  }
}

# Lambda functions
resource "aws_lambda_function" "functions" {
  for_each = local.lambda_functions

  function_name = "${var.project_name}-${each.key}"
  description   = each.value.description
  role          = aws_iam_role.lambda.arn
  handler       = each.value.handler
  runtime       = "python3.11"
  timeout       = each.value.timeout
  memory_size   = each.value.memory

  filename         = var.lambda_package_path
  source_code_hash = filebase64sha256(var.lambda_package_path)

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = local.common_environment
  }

  tags = {
    Name    = "${var.project_name}-${each.key}"
    Service = each.key
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "lambda" {
  for_each = local.lambda_functions

  name              = "/aws/lambda/${var.project_name}-${each.key}"
  retention_in_days = var.log_retention_days
}

# SQS trigger for screenshot Lambda
resource "aws_lambda_event_source_mapping" "screenshot_sqs" {
  event_source_arn = aws_sqs_queue.screenshot.arn
  function_name    = aws_lambda_function.functions["screenshot"].arn
  batch_size       = 1
  enabled          = true
}
