# ADR 0009: Single Container Deployment for POC

## Status

Accepted

## Context

We need to deploy "Das Duell um die Geld" for testing and demonstration purposes. The application consists of three components:

1. **Frontend**: Vue 3 SPA served via Nginx
2. **Backend**: NestJS API server
3. **Database**: PostgreSQL

Render.com offers a free tier for Docker-based web services, but:
- Free PostgreSQL was discontinued in 2024
- Separate services would require paid database hosting (~$7/month minimum)
- For a Proof of Concept (POC), cost should be minimal

## Decision

We will package all three components (PostgreSQL, NestJS Backend, Vue Frontend via Nginx) into a **single Docker container** for deployment on Render's free tier.

### Architecture

```
┌─────────────────────────────────────────────────┐
│              Single Docker Container            │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │  PostgreSQL │  │   NestJS    │  │  Nginx  │ │
│  │    :5432    │  │    :3000    │  │   :80   │ │
│  └─────────────┘  └─────────────┘  └─────────┘ │
│         │               │               │       │
│         └───────────────┴───────────────┘       │
│                         │                       │
└─────────────────────────│───────────────────────┘
                          │
                     Port 10000
                    (Render HTTP)
```

### How It Works

1. **Supervisor** manages all three processes in the container
2. **PostgreSQL** runs on port 5432 (internal only)
3. **NestJS Backend** runs on port 3000 (internal only)
4. **Nginx** runs on port 10000 (Render's default HTTP port)
   - Serves Vue frontend static files
   - Proxies `/api/*` requests to NestJS backend

### Trade-offs

**Pros:**
- Zero cost on Render free tier
- Simple deployment (single service)
- All data persists within the container's lifecycle
- Good enough for POC/demo purposes

**Cons:**
- No horizontal scaling
- If one component crashes, the entire container restarts
- Data loss on container restart (no persistent volume on free tier)
- Not suitable for production workloads
- Violates "one process per container" best practice

## Consequences

1. **For Testing/Demo**: This setup is sufficient
2. **For Production**: Must refactor to separate services (see ADR for future production deployment)
3. **Data Persistence**: Data is lost on redeploy - acceptable for POC
4. **Cold Starts**: Container may take 30-60s to start after inactivity (Render free tier spins down after 15 min)

## Future Refactoring Path

When moving to production:

1. Use Render's managed PostgreSQL ($7/month) or external provider (Neon, Supabase)
2. Deploy Backend as separate Web Service
3. Deploy Frontend as Static Site (free, CDN-backed)
4. Consider adding Redis for session management if needed

## References

- [Render Free Tier Documentation](https://render.com/docs/free)
- [Supervisor Process Manager](http://supervisord.org/)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
