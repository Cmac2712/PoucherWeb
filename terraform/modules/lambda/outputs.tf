output "function_arns" {
  description = "ARNs of all Lambda functions"
  value = {
    for k, v in aws_lambda_function.functions : k => v.arn
  }
}

output "function_names" {
  description = "Names of all Lambda functions"
  value = {
    for k, v in aws_lambda_function.functions : k => v.function_name
  }
}

output "function_invoke_arns" {
  description = "Invoke ARNs for API Gateway integration"
  value = {
    for k, v in aws_lambda_function.functions : k => v.invoke_arn
  }
}

output "lambda_role_arn" {
  description = "ARN of the Lambda IAM role"
  value       = aws_iam_role.lambda.arn
}

output "lambda_role_name" {
  description = "Name of the Lambda IAM role"
  value       = aws_iam_role.lambda.name
}

output "security_group_id" {
  description = "ID of the Lambda security group"
  value       = aws_security_group.lambda.id
}

output "screenshot_queue_url" {
  description = "URL of the screenshot SQS queue"
  value       = aws_sqs_queue.screenshot.url
}

output "screenshot_queue_arn" {
  description = "ARN of the screenshot SQS queue"
  value       = aws_sqs_queue.screenshot.arn
}
