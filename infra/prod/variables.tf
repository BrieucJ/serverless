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

variable "domain_name" {
  description = "Project's domain name"
  default = "toutatis.ai"
  type = string
}

variable "environment" {
  description = "Project's environment"
  default = "prod"
  type = string
}

locals {
  function_name="${var.project_name}-api-${var.environment}"
  role_name="${var.project_name}-role-${var.environment}"
  gateway_name="${var.project_name}-gateway-${var.environment}"
}