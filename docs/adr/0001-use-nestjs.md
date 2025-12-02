# ADR 0001: Use NestJS for Backend

## Status
Accepted

## Context
We need a backend framework for the game facilitator's REST API. The API must:
- Provide RESTful endpoints
- Support JWT authentication
- Enable input validation
- Work well with Prisma ORM
- Support TypeScript

## Decision
We use **NestJS** as the backend framework.

### Reasons:
1. **TypeScript-native**: NestJS is fully written in TypeScript and offers excellent type safety
2. **Modular architecture**: The module system enables clean separation of concerns
3. **Dependency Injection**: Built-in DI system for testable, maintainable code
4. **Decorator-based**: Clear, declarative API definition
5. **Passport integration**: Simple JWT authentication
6. **class-validator**: Built-in validation with decorators
7. **Large community**: Many plugins, good documentation

### Alternatives considered:
- **Express.js**: Too minimalistic, requires a lot of boilerplate
- **Fastify**: Faster, but less structured
- **Koa**: Similar to Express, no clear architecture

## Consequences

### Positive
- Clear project structure from the start
- Easy integration of middleware and guards
- Good testability through DI
- Consistent codebase

### Negative
- Higher learning curve than Express
- More boilerplate for small projects
- Dependency on the NestJS ecosystem

### Neutral
- Requires understanding of decorators and DI
