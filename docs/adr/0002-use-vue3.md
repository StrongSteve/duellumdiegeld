# ADR 0002: Use Vue 3 for Frontend

## Status
Accepted

## Context
We need a frontend framework for the tablet application. The requirements are:
- Fast, reactive user interface
- Component-based architecture
- State management for game state
- TypeScript support
- Good developer experience

## Decision
We use **Vue 3** with the Composition API as the frontend framework.

### Reasons:
1. **Composition API**: Better code organization and reusability
2. **TypeScript support**: Excellent TypeScript integration in Vue 3
3. **Pinia**: Modern, type-safe state management
4. **Small bundle size**: Important for fast loading on tablets
5. **Easy learning curve**: Clear documentation
6. **Single-File Components**: Clear component structure
7. **Reactivity System**: Automatic dependency tracking

### Alternatives considered:
- **React**: Larger community, but more boilerplate
- **Svelte**: Smaller bundle size, but smaller ecosystem
- **Angular**: Too complex for this application

## Consequences

### Positive
- Clear component structure
- Simple state management with Pinia
- Good performance on tablets
- Fast development

### Negative
- Smaller community than React
- Less job market relevance

### Neutral
- Requires understanding of the Composition API
