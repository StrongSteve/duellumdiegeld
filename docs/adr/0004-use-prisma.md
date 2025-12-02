# ADR 0004: Use Prisma as ORM

## Status
Accepted

## Context
We need an abstraction layer for database access that:
- Enables type-safe queries
- Supports migrations
- Handles relations easily
- Provides good developer experience

## Decision
We use **Prisma** as the Object-Relational Mapper (ORM).

### Reasons:
1. **Type Safety**: Generated TypeScript types from the schema
2. **Prisma Schema**: Declarative, readable database schema
3. **Migrations**: Automatic migration generation
4. **Prisma Studio**: GUI for database inspection
5. **Query API**: Intuitive, type-safe query API
6. **Relations**: Easy definition of relationships
7. **Seeding**: Built-in seed support

### Alternatives considered:
- **TypeORM**: More boilerplate, less type-safe
- **Sequelize**: Older API, JavaScript-focused
- **Raw SQL**: Too error-prone, no type support

## Consequences

### Positive
- No SQL injection risks
- Automatic types for frontend and backend
- Easy schema changes
- Good NestJS integration

### Negative
- Additional build step (Prisma Generate)
- Limited complex queries
- Dependency on Prisma ecosystem

### Neutral
- Own query language to learn
