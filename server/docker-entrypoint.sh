#!/bin/sh
set -e

echo "🔄 Starting container initialization..."

# Run database migrations
echo "⏳ Running database migrations..."
npm run typeorm:run:js

# If migrations succeed, start the application
echo "✅ Migrations completed successfully"
echo "🚀 Starting application..."
exec npm run start:prod