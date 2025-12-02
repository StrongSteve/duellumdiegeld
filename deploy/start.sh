#!/bin/bash
set -e

echo "=========================================="
echo "  Das Duell um die Geld - Starting..."
echo "=========================================="

# Create log directory
mkdir -p /var/log/supervisor

# Start PostgreSQL first to run migrations
echo "Starting PostgreSQL..."
service postgresql start

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h 127.0.0.1 -p 5432 -U dasduell; do
    echo "PostgreSQL is not ready yet..."
    sleep 2
done
echo "PostgreSQL is ready!"

# Run Prisma migrations
echo "Running database migrations..."
cd /app/backend
npx prisma db push --accept-data-loss
echo "Database migrations complete!"

# Stop PostgreSQL (supervisor will start it)
service postgresql stop

echo "=========================================="
echo "  Starting all services via Supervisor"
echo "=========================================="

# Start supervisor (which manages all services)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
