# ADR 0006: No Player Login Required

## Status
Accepted

## Context
The game is played on a shared tablet in the middle of the table. The question is whether players need individual accounts.

## Decision
**Players do not need a login**. The game is designed for anonymous group use.

### Reasons:
1. **Analog game experience**: The game is a tool, not a digital game
2. **Shared device**: All players share one tablet
3. **Quick start**: No registration, play immediately
4. **Offline money**: Play money is managed on paper
5. **Privacy**: No personal data required
6. **Simplicity**: Less complexity in the app

### Player handling:
- Player names are only entered for the current session
- Names are optional and only used for display
- No persistence of player data between sessions

### Exception - Admin:
- Admins need login for question management
- JWT-based authentication
- Separate admin area

## Consequences

### Positive
- Low barrier to entry
- No privacy issues with player data
- Simpler development
- Faster game start

### Negative
- No player statistics
- No personalized experiences
- No leaderboards

### Neutral
- Player names must be re-entered for each session
