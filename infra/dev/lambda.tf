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
    }
  }
}