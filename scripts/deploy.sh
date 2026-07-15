#!/bin/bash
set -e

PROFILE="katt-deploy"
STAGE="${1:-dev}"
STACK_NAME="katt-frontend-${STAGE}"
REGION="us-east-1"

echo "▸ Building frontend..."
npm run build

echo "▸ Getting stack outputs..."
BUCKET=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --profile "$PROFILE" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
DIST_ID=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --profile "$PROFILE" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)

echo "▸ Syncing to s3://${BUCKET}..."
aws s3 sync dist/ "s3://${BUCKET}" --delete --profile "$PROFILE" --region "$REGION"

echo "▸ Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*" --profile "$PROFILE" --region "$REGION" > /dev/null

echo "✓ Deploy complete!"
echo "  URL: https://$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --profile "$PROFILE" --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionUrl'].OutputValue" --output text | sed 's|https://||')"
