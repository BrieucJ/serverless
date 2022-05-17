output "function_name" {
  description = "Lambda function's name"
  value = aws_lambda_function.lambda.function_name
}

output "base_url" {
  description = "Base URL for API Gateway stage"
  value = aws_apigatewayv2_stage.stage.invoke_url
}

output "route53" {
  description = "aws_route53_record alias"
  value = aws_route53_record.dns_record.alias
}