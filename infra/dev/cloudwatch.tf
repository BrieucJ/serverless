resource "aws_cloudwatch_log_group" "gateway" {
  name = "/aws/gateway/${aws_apigatewayv2_api.api.name}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "lambda" {
  name = "/aws/lambda/${aws_lambda_function.lambda.function_name}" 
  retention_in_days = 30
}