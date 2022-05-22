data "aws_caller_identity" "current" {}

data "terraform_remote_state" "common" {
  backend = "local"
  config = {
    path = "../common/terraform.tfstate"
  }
}

data "terraform_remote_state" "env" {
  depends_on=[mongodbatlas_cluster.cluster]
  backend = "local"
  config = {
    path = "./terraform.tfstate"
  }
}

variable "aws_region" {
  description = "AWS region"
  type = string
}

variable "project_name" {
  description = "Project's name"
  type = string
}

variable "domain_name" {
  description = "Project's domain name"
  type = string
}

variable "environment" {
  description = "Project's environment"
  type = string
}

variable "database_instance_size" {
  description = "MongoDB Atlas instance size"
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
  type = string
}

variable "ACCESS_TOKEN_SECRET" {
  description = "ACCESS_TOKEN_SECRET"
  type = string
}

variable "REFRESH_TOKEN_SECRET" {
  description = "REFRESH_TOKEN_SECRET"
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