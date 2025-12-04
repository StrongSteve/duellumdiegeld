# ADR-0012: Session Reset on Browser Refresh

## Status

Accepted

## Context

The application is a game facilitator designed to guide players through quiz rounds step by step. Game state is managed in the browser (Pinia store) and persists across normal navigation.

However, when a user refreshes the browser (F5, Cmd+R, or swipe-to-refresh on mobile), several issues arise:

1. **Stale game state**: The URL might be `/game` but the Pinia store is reset, leading to an inconsistent UI
2. **Missing disclaimer**: The legal disclaimer modal should be shown on every app start for legal compliance
3. **Confusing UX**: Users might end up on a game screen without proper context of which round they're in
4. **Deep link inconsistency**: Direct links to `/game` or `/game/setup` don't make sense without prior setup

## Decision

Implement a **navigation guard** that redirects all non-admin routes to the home page (`/`) on initial page load (browser refresh).

### Implementation

```typescript
// router/index.ts
let isInitialLoad = true

router.beforeEach((to, _from, next) => {
  // On initial page load (browser refresh), redirect to home
  // Exception: admin routes (allow direct access for admins)
  if (isInitialLoad) {
    isInitialLoad = false
    if (to.path !== '/' && !to.path.startsWith('/admin')) {
      next({ path: '/' })
      return
    }
  }
  next()
})
```

### Behavior

| Route | Refresh Behavior |
|-------|------------------|
| `/` | Stay on home (disclaimer shown) |
| `/game` | Redirect to `/` |
| `/game/setup` | Redirect to `/` |
| `/submit-question` | Redirect to `/` |
| `/admin/*` | Stay on admin route (auth check applies) |

### Why Admin Routes Are Excluded

- Admins may bookmark the dashboard or review page
- Admin routes have their own auth guard (redirects to login if not authenticated)
- Admin workflow is different from player workflow

## Consequences

### Positive

- **Consistent UX**: Every session starts from home with the disclaimer
- **Legal compliance**: Disclaimer is always shown on app start
- **Clean state**: No stale game data after refresh
- **Simple implementation**: Single flag in router guard
- **No storage overhead**: No need to persist game state to localStorage

### Negative

- **Lost progress**: If someone accidentally refreshes during a game, they lose their current round
- **No deep linking**: Can't share a link to a specific game state (but this was never intended)

### Trade-offs Accepted

- The game is designed for continuous sessions, not bookmarking mid-game
- Players can easily restart from game setup (player names are still in store until cleared)
- The disclaimer requirement makes refresh-to-home the expected behavior anyway

## Alternatives Considered

### 1. Persist full game state to localStorage

**Rejected because:**
- Adds complexity for state serialization/deserialization
- Stale state issues if localStorage isn't cleared properly
- Still need to show disclaimer, which disrupts flow anyway

### 2. Show "Resume or Start New" dialog

**Rejected because:**
- Over-engineering for a POC
- The game is meant for continuous play sessions
- Adds UI complexity

### 3. No redirect, just show disclaimer overlay

**Rejected because:**
- Game screens without context are confusing
- Players might click through disclaimer and be lost

## Related

- ADR-0005: Browser-Side Session Management (game state in Pinia)
- ADR-0006: No Player Login Required (no server-side session to restore)
