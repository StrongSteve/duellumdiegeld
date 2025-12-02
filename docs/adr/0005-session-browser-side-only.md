# ADR 0005: Store Game Session Primarily in Browser

## Status
Accepted

## Context
The game state must persist between page changes and browser reloads. There are two options:
1. Store everything on the server
2. Store primarily in the browser (LocalStorage) with optional server synchronization

## Decision
We store the **game state primarily in the browser (LocalStorage)** with optional server backup.

### Reasons:
1. **Offline capability**: Game works even without internet connection
2. **Speed**: No network latency for state changes
3. **Simplicity**: Less server complexity
4. **Single tablet**: The game runs on a single device
5. **No multi-device**: No synchronization between devices needed
6. **Fast recovery**: Immediate resumption after reload

### What is stored:
- Current question
- Game phase (state)
- Already used question IDs
- Player settings
- Round number

### Server component (optional):
- Session ID for later analysis
- Backup of used questions

## Consequences

### Positive
- Fast, reactive user interface
- Works offline
- No server load for game state
- Simpler architecture

### Negative
- State is lost when browser cache is cleared
- No device synchronization
- No server-side game history (without explicit saving)

### Neutral
- LocalStorage limit (5-10 MB) is sufficient
