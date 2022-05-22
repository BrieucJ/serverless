data "archive_file" "zip" {
  type = "zip"
  source_dir = "../../dist"
  output_path = "../../dist.zip"
}

resource "aws_lambda_function" "lambda" {
  function_name = local.function_name
  filename = data.archive_file.zip.output_path
  source_code_hash = filebase64sha256(data.archive_file.zip.output_path)
  runtime = "nodejs14.x"
  handler = "lambda.handler"
  role = aws_iam_role.lambda_exec.arn
  environment {
    variables = {
      NODE_ENV = "development"
      DATABASE_URL=data.terraform_remote_state.env.outputs.mongo_db_url
      LOG_LEVEL="info"
      ACCESS_TOKEN_SECRET=var.ACCESS_TOKEN_SECRET
      REFRESH_TOKEN_SECRET=var.REFRESH_TOKEN_SECRET
    }
  }
}