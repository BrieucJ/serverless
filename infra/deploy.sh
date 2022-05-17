#!/bin/bash
[[ $1 != 'prod' && $1 != 'dev' ]] && { echo 'usage: deploy.sh <prod | dev>'; exit 1; } ;

# variables
PROJECT_NAME=new-project
FUNCTION_NAME="$PROJECT_NAME-api-$1"
GATEWAY_NAME="$PROJECT_NAME-gateway-$1"
ENV_NAME='production'
if [ $1 = "dev" ]; then
    ENV_NAME='development'
fi

#root account id
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
API_GATEWAY_ID=$(aws apigatewayv2 get-apis --region=$AWS_REGION --query "Items[?Name=='$GATEWAY_NAME'].ApiId" --output text)

echo "zip dist.js"
cd dist
zip -r ../dist.zip * >> /dev/null
cd ..

echo "update-function-code $FUNCTION_NAME"
aws lambda update-function-code --function-name=$FUNCTION_NAME --region=$AWS_REGION --zip-file=fileb://dist.zip --publish

echo "waiting for function to update"
aws lambda wait function-updated --function-name=$FUNCTION_NAME --region=$AWS_REGION >> /dev/null

echo "update environment variable $1"
aws lambda update-function-configuration --function-name=$FUNCTION_NAME --region=$AWS_REGION --environment="Variables={NODE_ENV=$ENV_NAME,DATABASE_URL=$DATABASE_URL,LOG_LEVEL=$LOG_LEVEL,ACCESS_TOKEN_SECRET=$ACCESS_TOKEN_SECRET,REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET}" >> /dev/null

echo "waiting for function-configuration to update"
aws lambda wait function-updated --function-name=$FUNCTION_NAME --region=$AWS_REGION >> /dev/null

VERSION=$(aws lambda publish-version --function-name="$FUNCTION_NAME" --region=$AWS_REGION --description=$1 --query Version --output text)
echo "published version: $VERSION"