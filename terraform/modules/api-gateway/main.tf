# API Gateway Module
# Creates HTTP API with Lambda integrations

data "aws_region" "current" {}

# Normalize stage name for tag values (API Gateway requires tag chars subset)
locals {
  stage_tag = var.stage_name == "$default" ? "default" : var.stage_name
}

# HTTP API
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"
  description   = "HTTP API for ${var.project_name}"

  cors_configuration {
    allow_origins     = var.cors_allow_origins
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers     = ["Content-Type", "Authorization"]
    expose_headers    = ["*"]
    max_age           = 3600
    allow_credentials = false
  }

  tags = {
    Name = "${var.project_name}-api"
  }
}

# API Stage
resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.stage_name
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api.arn
    format = jsonencode({
      requestId         = "$context.requestId"
      ip                = "$context.identity.sourceIp"
      requestTime       = "$context.requestTime"
      httpMethod        = "$context.httpMethod"
      routeKey          = "$context.routeKey"
      status            = "$context.status"
      protocol          = "$context.protocol"
      responseLength    = "$context.responseLength"
      integrationError  = "$context.integrationErrorMessage"
      integrationStatus = "$context.integrationStatus"
    })
  }

  default_route_settings {
    throttling_burst_limit = 100
    throttling_rate_limit  = 50
  }

  tags = {
    Name = "${var.project_name}-api-${local.stage_tag}"
  }
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/apigateway/${var.project_name}-api"
  retention_in_days = var.log_retention_days
}

# Lambda Integrations
resource "aws_apigatewayv2_integration" "auth" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_invoke_arns["auth"]
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "bookmarks" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_invoke_arns["bookmarks"]
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "tags" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_invoke_arns["tags"]
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "users" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_invoke_arns["users"]
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "screenshot" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_invoke_arns["screenshot"]
  integration_method     = "POST"
  payload_format_version = "2.0"
}

# Routes - Auth
resource "aws_apigatewayv2_route" "auth_init" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/auth/init"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

# Routes - Bookmarks
resource "aws_apigatewayv2_route" "bookmarks_list" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/bookmarks"
  target    = "integrations/${aws_apigatewayv2_integration.bookmarks.id}"
}

resource "aws_apigatewayv2_route" "bookmarks_create" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/bookmarks"
  target    = "integrations/${aws_apigatewayv2_integration.bookmarks.id}"
}

resource "aws_apigatewayv2_route" "bookmarks_update" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /api/bookmarks/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.bookmarks.id}"
}

resource "aws_apigatewayv2_route" "bookmarks_delete" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "DELETE /api/bookmarks/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.bookmarks.id}"
}

# Routes - Tags
resource "aws_apigatewayv2_route" "tags_create" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/tags"
  target    = "integrations/${aws_apigatewayv2_integration.tags.id}"
}

resource "aws_apigatewayv2_route" "tags_update" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /api/tags/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.tags.id}"
}

resource "aws_apigatewayv2_route" "tags_delete" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "DELETE /api/tags/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.tags.id}"
}

# Routes - Users
resource "aws_apigatewayv2_route" "users_update" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /api/users/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.users.id}"
}

# Routes - Screenshot
resource "aws_apigatewayv2_route" "screenshot_create" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/screenshot"
  target    = "integrations/${aws_apigatewayv2_integration.screenshot.id}"
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  for_each = var.lambda_function_names

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = each.value
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
