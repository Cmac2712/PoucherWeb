output "api_id" {
  description = "ID of the API Gateway"
  value       = aws_apigatewayv2_api.main.id
}

output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "stage_invoke_url" {
  description = "Invoke URL for the API stage"
  value       = aws_apigatewayv2_stage.main.invoke_url
}

output "execution_arn" {
  description = "Execution ARN for Lambda permissions"
  value       = aws_apigatewayv2_api.main.execution_arn
}

output "api_endpoints" {
  description = "Full API endpoint URLs"
  value = {
    auth_init       = "${aws_apigatewayv2_stage.main.invoke_url}/api/auth/init"
    bookmarks       = "${aws_apigatewayv2_stage.main.invoke_url}/api/bookmarks"
    bookmarks_by_id = "${aws_apigatewayv2_stage.main.invoke_url}/api/bookmarks/{id}"
    tags            = "${aws_apigatewayv2_stage.main.invoke_url}/api/tags"
    tags_by_id      = "${aws_apigatewayv2_stage.main.invoke_url}/api/tags/{id}"
    users_by_id     = "${aws_apigatewayv2_stage.main.invoke_url}/api/users/{id}"
    screenshot      = "${aws_apigatewayv2_stage.main.invoke_url}/api/screenshot"
  }
}
