terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 4.0.0"
    }
    archive = {
      source = "hashicorp/archive"
      version = "~> 2.2.0"
    }
  }
  required_version = "~> 1.0"
}

# VAR
variable "aws_region" {
  description = "AWS region"
  default = "eu-west-3"
  type = string
}

variable "project_name" {
  description = "Project's name"
  default = "new-project"
  type = string
}

provider "aws" {
  region = var.aws_region
}

locals {
  prefix="${var.project_name}"
  function_name="${var.project_name}-api"
  role_name="${var.project_name}-role"
  gateway_name="${var.project_name}-gateway"
}

data "archive_file" "zip" {
  type = "zip"
  source_dir = "../src"
  output_path = "../src.zip"
}

# LAMBDA
resource "aws_lambda_function" "api" {
  function_name = local.function_name
  filename = data.archive_file.zip.output_path
  source_code_hash = filebase64sha256(data.archive_file.zip.output_path)
  runtime = "nodejs14.x"
  handler = "index.handler"
  role = aws_iam_role.lambda_exec.arn
}

resource "aws_cloudwatch_log_group" "api" {
  name = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = 30
}

resource "aws_lambda_alias" "alias_dev" {
  name             = "dev"
  description      = "dev"
  function_name    = aws_lambda_function.api.arn
  function_version = "$LATEST"
}

resource "aws_lambda_alias" "alias_prod" {
  name             = "prod"
  description      = "prod"
  function_name    = aws_lambda_function.api.arn
  function_version = "$LATEST"
}

#IAM
resource "aws_iam_role" "lambda_exec" {
  name = local.role_name
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# API GATEWAY
resource "aws_apigatewayv2_api" "lambda" {
  name = local.gateway_name
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "dev" {
  api_id = aws_apigatewayv2_api.lambda.id
  name = "dev"
  auto_deploy = false
  deployment_id=aws_apigatewayv2_deployment.dev.id
  stage_variables = {
    "stage" = "dev"
  }
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId = "$context.requestId"
      sourceIp = "$context.identity.sourceIp"
      requestTime = "$context.requestTime"
      protocol = "$context.protocol"
      httpMethod = "$context.httpMethod"
      resourcePath = "$context.resourcePath"
      routeKey = "$context.routeKey"
      status = "$context.status"
      responseLength = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id = aws_apigatewayv2_api.lambda.id
  deployment_id=aws_apigatewayv2_deployment.prod.id
  name = "prod"
  auto_deploy = false
  stage_variables = {
    "stage" = "prod"
  }
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId = "$context.requestId"
      sourceIp = "$context.identity.sourceIp"
      requestTime = "$context.requestTime"
      protocol = "$context.protocol"
      httpMethod = "$context.httpMethod"
      resourcePath = "$context.resourcePath"
      routeKey = "$context.routeKey"
      status = "$context.status"
      responseLength = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_apigatewayv2_deployment" "dev" {
  api_id      = aws_apigatewayv2_route.api.api_id
  description = "Development deployment"
  depends_on = [
    aws_apigatewayv2_integration.api
  ]
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_apigatewayv2_deployment" "prod" {
  api_id      = aws_apigatewayv2_route.api.api_id
  description = "Production deployment"
  depends_on = [
    aws_apigatewayv2_integration.api
  ]
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lambda_permission" "dev" {
  statement_id = "AllowExecutionFromAPIGateway"
  action = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.api.function_name}:dev"
  principal = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}

resource "aws_lambda_permission" "prod" {
  statement_id = "AllowExecutionFromAPIGateway"
  action = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.api.function_name}:prod"
  principal = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}

resource "aws_apigatewayv2_integration" "api" {
  api_id = aws_apigatewayv2_api.lambda.id
  # integration_uri = aws_lambda_function.api.invoke_arn
  integration_uri = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/${aws_lambda_function.api.arn}:$${stageVariables.stage}/invocations"
  # integration_uri = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/$${stageVariables.stage}/invocations"
  integration_type = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "api" {
  api_id = aws_apigatewayv2_api.lambda.id
  route_key = "$default"
  target = "integrations/${aws_apigatewayv2_integration.api.id}"
}

#CLOUDWATCH / PERMISSION
resource "aws_cloudwatch_log_group" "api_gateway" {
  name = "/aws/api_gateway/${aws_apigatewayv2_api.lambda.name}"
  retention_in_days = 30
}

# OUTPUTS
# output "api_bucket_name" {
#   description = "Name of the S3 bucket used to store function code."
#   value = aws_s3_bucket.api_bucket.id
# }

output "function_name" {
  description = "Name of the Lambda function."
  value = aws_lambda_function.api.function_name
}

output "base_url_dev" {
  description = "Base URL for API Gateway stage."
  value = aws_apigatewayv2_stage.dev.invoke_url
}

output "api_arn_dev" {
  description = "ARN for API Gateway stage."
  value = aws_apigatewayv2_stage.dev.arn
}

output "base_url_prod" {
  description = "Base URL for API Gateway stage."
  value = aws_apigatewayv2_stage.prod.invoke_url
}

output "api_arn_prod" {
  description = "ARN for API Gateway stage."
  value = aws_apigatewayv2_stage.prod.arn
}