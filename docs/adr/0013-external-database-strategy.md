# ADR-0013: External Database Strategy

## Status

Accepted

## Context

The application is deployed on Render.com's free tier using a single Docker container that includes PostgreSQL, NestJS backend, and Nginx serving the Vue frontend (see ADR-0009).

A significant limitation of this setup is **data loss on every redeploy**:
- Container restarts reset the embedded PostgreSQL database
- All questions, ratings, and admin data are lost
- Re-seeding provides only the default dataset

For a POC, this was acceptable, but for ongoing use, database persistence is essential.

## Decision

Support an **optional external database** (e.g., Supabase, Neon, Railway) while keeping embedded PostgreSQL as a fallback for local development and testing.

### Detection Strategy

The `start.sh` script detects whether to use external or embedded PostgreSQL based on the presence of the `DATABASE_URL` environment variable:

```bash
if [ -n "$DATABASE_URL" ]; then
    # External database: skip PostgreSQL startup
    USE_EXTERNAL_DB=true
else
    # Embedded database: start PostgreSQL in container
    USE_EXTERNAL_DB=false
    export DATABASE_URL="postgresql://dasduell:dasduell@127.0.0.1:5432/dasduell?schema=public"
fi
```

### Dynamic Supervisor Configuration

The supervisor config is generated at runtime:
- **External DB mode**: Only runs `backend` and `nginx`
- **Embedded DB mode**: Runs `postgresql`, `backend`, and `nginx`

### Health Check Enhancement

The `/api/health` endpoint now verifies database connectivity:

```typescript
@Get()
async check() {
  let dbStatus = 'ok';
  try {
    await this.prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'error';
  }
  return {
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    database: dbStatus,
  };
}
```

This helps Render know when the service is truly ready.

### Seeding Behavior

The seeder checks for existing data before seeding:
- If questions exist in the database, seeding is skipped
- This prevents duplicate data after redeployments
- Fresh databases are still seeded automatically

## Configuration

### Render Dashboard Setup

1. Create a PostgreSQL database on Supabase, Neon, or similar
2. In Render dashboard, add environment variable:
   - Key: `DATABASE_URL`
   - Value: `postgresql://user:password@host:port/database?pgbouncer=true&sslmode=require`
3. Mark as "Secret" (Render encrypts it)
4. Redeploy the service

### Connection String Format

For Supabase with connection pooling:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

For direct connection (without pooling):
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

## Consequences

### Positive

- **Data persistence**: Questions, ratings, and admin data survive redeployments
- **Automatic migrations**: Prisma runs `db push` on every start
- **Backward compatible**: Works without external DB (falls back to embedded)
- **No code changes required**: Pure configuration-based switching
- **Better health checks**: Database connectivity is verified
- **Supabase free tier**: 500MB storage, sufficient for POC

### Negative

- **External dependency**: Relies on third-party database service
- **Network latency**: Slightly slower than embedded PostgreSQL
- **Connection pooling**: May require pgbouncer configuration for Supabase
- **Secret management**: DATABASE_URL must be set as secret in Render

### Risks Mitigated

- **Connection issues**: Health check returns "degraded" if DB is unreachable
- **Schema drift**: Prisma `db push` ensures schema is always up-to-date
- **Duplicate seeding**: Seeder checks before inserting

## Alternatives Considered

### 1. Render PostgreSQL Add-on

**Rejected because:**
- Not available on free tier
- Would require infrastructure cost for POC

### 2. Persistent Volume on Render

**Rejected because:**
- Not available on free tier
- Would still lose data on dyno cycling

### 3. SQLite with Litestream

**Rejected because:**
- Requires additional setup for S3 backup
- Schema is already PostgreSQL-specific
- More complex than external PostgreSQL

### 4. File-based backup on startup/shutdown

**Rejected because:**
- No shutdown hook available on container termination
- Unreliable for data integrity
- Complex to implement correctly

## Related

- ADR-0003: Use PostgreSQL for Database
- ADR-0009: Single Container Deployment
