# ADR 0003: Use PostgreSQL as Database

## Status
Accepted

## Context
We need a database for:
- Storage of questions, hints, and answers
- Admin users and authentication
- Optional game sessions
- Status tracking (pending, approved, rejected)

## Decision
We use **PostgreSQL** as the relational database.

### Reasons:
1. **Reliability**: Proven, stable database
2. **ACID-compliant**: Guaranteed transactions
3. **JSON support**: Flexible storage of settings
4. **Prisma integration**: Excellent support by Prisma ORM
5. **Cloud options**: Supabase, Neon, Railway offer managed PostgreSQL
6. **Scalability**: Scalable from small to large
7. **Free**: Open source, no license costs

### Alternatives considered:
- **MySQL/MariaDB**: Fewer features, worse JSON support
- **MongoDB**: Not necessary for relational data
- **SQLite**: Not suitable for production with multiple clients

## Consequences

### Positive
- Reliable data storage
- Easy hosting with cloud providers
- Good Prisma integration
- Migration support

### Negative
- Requires separate database instance
- More complex than SQLite for local development

### Neutral
- Requires Docker for local development
