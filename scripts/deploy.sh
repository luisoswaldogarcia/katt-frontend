#!/bin/bash
set -e

BUCKET="katt-frontend-dev-179241536654"
DISTRIBUTION_ID="E3M6J4KO6U7D8G"

echo "🚀 Deploying katt-frontend..."

echo "📦 Building..."
npm run build

echo "☁️  Syncing to S3..."
aws s3 sync dist/ "s3://$BUCKET" --delete

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" --query "Invalidation.Id" --output text

echo "✅ Deploy complete!"
echo "🌐 https://d1fn2u7xetgmq1.cloudfront.net"
