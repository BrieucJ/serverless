output "function_name" {
  description = "Lambda function's name"
  value = aws_lambda_function.lambda.function_name
}

output "base_url" {
  description = "Base URL for API Gateway stage"
  value = aws_apigatewayv2_stage.stage.invoke_url
}

output "domain_name" {
  description = "Lambda gateway domain url"
  value = aws_apigatewayv2_domain_name.api.domain_name
}

output "mongoDB_url" {
  description = "mongoDB connexion string"
  value=mongodbatlas_cluster.cluster.connection_strings[0].standard_srv
}