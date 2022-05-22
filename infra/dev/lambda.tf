data "archive_file" "zip" {
  type = "zip"
  source_dir = "../../dist"
  output_path = "../../dist.zip"
}

resource "aws_lambda_function" "lambda" {
  depends_on=[mongodbatlas_cluster.cluster]
  function_name = local.function_name
  filename = data.archive_file.zip.output_path
  source_code_hash = filebase64sha256(data.archive_file.zip.output_path)
  runtime = "nodejs14.x"
  handler = "lambda.handler"
  role = aws_iam_role.lambda_exec.arn
  memory_size=2048
  environment {
    variables = {
      NODE_ENV = "development"
      DATABASE_URL="mongodb+srv://${var.mongodbatlas_user}:${var.mongodbatlas_password}@${split("//", mongodbatlas_cluster.cluster.connection_strings[0].standard_srv)[1]}/${var.mongodbatlas_database_name}?retryWrites=true&w=majority"
      LOG_LEVEL="info"
      ACCESS_TOKEN_SECRET=var.ACCESS_TOKEN_SECRET
      REFRESH_TOKEN_SECRET=var.REFRESH_TOKEN_SECRET
    }
  }
}