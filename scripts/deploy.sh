#!/bin/bash
set -e

STAGE=${1:-dev}
BUCKET="katt-frontend-${STAGE}-179241536654"
DISTRIBUTION="E3M6J4KO6U7D8G"

echo "🚀 Deploying katt-frontend [$STAGE]..."

echo "📦 Building..."
npm run build

echo "☁️  Syncing to S3..."
aws s3 sync dist/ "s3://${BUCKET}" --delete --profile katt-deploy

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION" --paths "/*" --profile katt-deploy --output table

echo "✅ Deploy complete!"
