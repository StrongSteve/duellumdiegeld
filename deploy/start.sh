#!/bin/bash
set -e

echo "=========================================="
echo "  Das Duell um die Geld - Starting..."
echo "=========================================="

# Create log directory
mkdir -p /var/log/supervisor

# Check if external DATABASE_URL is provided (e.g., Supabase)
if [ -n "$DATABASE_URL" ]; then
    echo "External DATABASE_URL detected - using external database (e.g., Supabase)"
    USE_EXTERNAL_DB=true

    # Export DATABASE_URL for Prisma
    export DATABASE_URL="$DATABASE_URL"
else
    echo "No external DATABASE_URL - using embedded PostgreSQL"
    USE_EXTERNAL_DB=false

    # Set internal DATABASE_URL
    export DATABASE_URL="postgresql://dasduell:dasduell@127.0.0.1:5432/dasduell?schema=public"

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
fi

# Run Prisma migrations
echo "Running database migrations..."
cd /app/backend
npx prisma db push --accept-data-loss
echo "Database migrations complete!"

# Stop PostgreSQL if started (supervisor will start it)
if [ "$USE_EXTERNAL_DB" = false ]; then
    service postgresql stop
fi

# Generate supervisor config based on database mode
echo "Generating supervisor configuration..."
if [ "$USE_EXTERNAL_DB" = true ]; then
    # External DB: No PostgreSQL process, use env DATABASE_URL
    cat > /etc/supervisor/conf.d/supervisord.conf << 'SUPERVISOR_EOF'
[supervisord]
nodaemon=true
logfile=/dev/stdout
logfile_maxbytes=0
pidfile=/var/run/supervisord.pid
user=root

[program:backend]
command=node /app/backend/dist/src/main.js
directory=/app/backend
user=root
autostart=true
autorestart=true
priority=20
startsecs=5
startretries=5
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
environment=NODE_ENV="production",PORT="3000"

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
autostart=true
autorestart=true
priority=30
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
SUPERVISOR_EOF
else
    # Internal DB: Include PostgreSQL process
    cat > /etc/supervisor/conf.d/supervisord.conf << 'SUPERVISOR_EOF'
[supervisord]
nodaemon=true
logfile=/dev/stdout
logfile_maxbytes=0
pidfile=/var/run/supervisord.pid
user=root

[program:postgresql]
command=/usr/lib/postgresql/14/bin/postgres -D /var/lib/postgresql/14/main -c config_file=/etc/postgresql/14/main/postgresql.conf
user=postgres
autostart=true
autorestart=true
priority=10
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:backend]
command=node /app/backend/dist/src/main.js
directory=/app/backend
user=root
autostart=true
autorestart=true
priority=20
startsecs=5
startretries=5
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
environment=DATABASE_URL="postgresql://dasduell:dasduell@127.0.0.1:5432/dasduell?schema=public",NODE_ENV="production",PORT="3000"

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
autostart=true
autorestart=true
priority=30
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
SUPERVISOR_EOF
fi

echo "=========================================="
echo "  Starting all services via Supervisor"
echo "=========================================="

# Start supervisor (which manages all services)
# Pass DATABASE_URL to supervisor so it's available to backend
exec env DATABASE_URL="$DATABASE_URL" /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
