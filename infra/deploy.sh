#!/bin/bash

# variables
AWS_REGION=eu-west-3
PROJECT_NAME=new-project
FUNCTION_NAME="$PROJECT_NAME-api"
GATEWAY_NAME="$PROJECT_NAME-gateway"

[[ $1 != 'prod' && $1 != 'dev' ]] && { echo 'usage: deploy.sh <prod | dev>'; exit 1; } ;

# root account id
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
API_GATEWAY_ID=$(aws apigatewayv2 get-apis --region='eu-west-3' --query "Items[?Name==$GATEWAY_NAME].ApiId" --output text)
echo "API_GATEWAY_ID: $API_GATEWAY_ID"
echo "ACCOUNT_ID: $ACCOUNT_ID"

echo "zip src/index.js"
rm src.zip
cd src
zip -r ../src.zip *
cd ..

echo "aws lambda update-function-code $FUNCTION_NAME"
aws lambda update-function-code --function-name=$FUNCTION_NAME --region=$AWS_REGION --zip-file=fileb://src.zip 2>/dev/null

echo "waiting for function to update"
aws lambda wait function-updated --function-name=$FUNCTION_NAME --region=$AWS_REGION 2>/dev/null

VERSION=$(aws lambda publish-version --function-name="$FUNCTION_NAME" --region=$AWS_REGION --description=$1 --query Version --output text)
echo "published version: $VERSION"

echo "update alias $1"
aws lambda update-alias --function-name=$FUNCTION_NAME --name=$1 --function-version=$VERSION --region=$AWS_REGION 2>/dev/null
