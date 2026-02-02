#!/bin/sh
set -e

echo "🔄 Starting container initialization..."

# Check if maintenance mode is enabled
if [ "$MAINTENANCE_MODE" != "true" ]; then
  # Run database migrations
  echo "⏳ Running database migrations..."
  npm run typeorm:run:js
fi

# If migrations succeed, start the application
echo "✅ Migrations completed successfully"
echo "🚀 Starting application..."
exec npm run start:prod