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
  prefix="${var.project_name}-${terraform.workspace}"
  bucket_name="${var.project_name}-${terraform.workspace}-bucket"
  function_name="${var.project_name}-${terraform.workspace}-api"
  role_name="${var.project_name}-${terraform.workspace}-lambda_role"
  gateway_name="${var.project_name}-${terraform.workspace}-gateway"
}

# S3 BUCKET
resource "aws_s3_bucket" "api_bucket" {
  bucket = local.bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_acl" "api_bucket" {
  bucket = aws_s3_bucket.api_bucket.id
  acl = "private"
}

data "archive_file" "api_lambda_zip" {
  type = "zip"
  source_dir = "${path.module}/../src"
  output_path = "${path.module}/../src.zip"
}

resource "aws_s3_object" "api_lambda_zip" {
  bucket = aws_s3_bucket.api_bucket.id
  key = "${var.project_name}.zip"
  source = data.archive_file.api_lambda_zip.output_path
  etag = filemd5(data.archive_file.api_lambda_zip.output_path)
}

# LAMBDA
resource "aws_lambda_function" "api" {
  function_name = local.function_name
  s3_bucket = aws_s3_bucket.api_bucket.id
  s3_key = aws_s3_object.api_lambda_zip.key
  runtime = "nodejs14.x"
  handler = "index.handler"
  source_code_hash = data.archive_file.api_lambda_zip.output_base64sha256
  role = aws_iam_role.lambda_exec.arn
}

resource "aws_cloudwatch_log_group" "api" {
  name = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = 30
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
  auto_deploy = true
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
  name = "prod"
  auto_deploy = true
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

resource "aws_apigatewayv2_integration" "api" {
  api_id = aws_apigatewayv2_api.lambda.id
  integration_uri = aws_lambda_function.api.invoke_arn
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

resource "aws_lambda_permission" "api_gateway" {
  statement_id = "AllowExecutionFromAPIGateway"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}

# OUTPUTS
output "api_bucket_name" {
  description = "Name of the S3 bucket used to store function code."
  value = aws_s3_bucket.api_bucket.id
}

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