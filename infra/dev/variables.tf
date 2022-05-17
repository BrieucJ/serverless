data "aws_caller_identity" "current" {}

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
  default = "dev"
  type = string
}

variable "mongodbatlas_public_key" {
  description = "MongoDB Atlas public key"
  type = string
}

variable "mongodbatlas_private_key" {
  description = "MongoDB Atlas private key"
  type = string
}

variable "mongodbatlas_user" {
  description = "MongoDB Atlas dev user"
  type = string
}

variable "mongodbatlas_password" {
  description = "MongoDB Atlas dev password"
  type = string
}

variable "mongodbatlas_database_name" {
  description = "MongoDB Atlas dev database name"
  type = string
}

variable "atlas_region" {
  description = "MongoDB Atlas dev database name"
  default = "EU-WEST-3"
  type = string
}

locals {
  account_id = data.aws_caller_identity.current.account_id
  mongo_project_name="${var.project_name}-mongo-project-${var.environment}"
  function_name="${var.project_name}-api-${var.environment}"
  role_name="${var.project_name}-role-${var.environment}"
  gateway_name="${var.project_name}-gateway-${var.environment}"
  cluster_name="${var.project_name}-cluster-${var.environment}"
}