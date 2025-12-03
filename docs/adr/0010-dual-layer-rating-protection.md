# ADR-0010: Dual-Layer Rating Protection

## Status

Accepted

## Context

The application allows users to rate questions on a 1-5 star scale. Without protection, users could manipulate ratings by:
- Repeatedly clicking to submit multiple ratings
- Refreshing the page and re-rating
- Using different browsers/devices to submit multiple ratings
- Clearing browser data and re-rating

This could skew question quality metrics and affect the weighted random question selection algorithm.

## Decision

Implement a **dual-layer protection system**:

### Layer 1: Frontend (localStorage)

- Store rated question IDs in localStorage under key `ratedQuestions`
- Check localStorage before showing rating UI or allowing submission
- Prevents accidental double-rating within same browser session
- Fast, no network round-trip required

```typescript
// Check before rating
const ratedQuestions = JSON.parse(localStorage.getItem('ratedQuestions') || '[]')
if (ratedQuestions.includes(questionId)) return

// After successful rating
ratedQuestions.push(questionId)
localStorage.setItem('ratedQuestions', JSON.stringify(ratedQuestions))
```

### Layer 2: Backend (IP Hash)

- New `QuestionRating` database table with:
  - `questionId`: Reference to the question
  - `ipHash`: SHA-256 hash of the client IP address
  - `rating`: The rating value (1-5)
  - `createdAt`: Timestamp
  - Unique constraint on `(questionId, ipHash)`

- On rating request:
  1. Extract client IP from `x-forwarded-for` header (for proxied requests) or socket
  2. Hash IP with SHA-256 (privacy-preserving)
  3. Check for existing rating with same questionId + ipHash
  4. Reject with 400 error if duplicate found
  5. Use database transaction to create rating and update question counters atomically

```typescript
const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex');

const existingRating = await prisma.questionRating.findUnique({
  where: { questionId_ipHash: { questionId, ipHash } }
});

if (existingRating) {
  throw new BadRequestException('Du hast diese Frage bereits bewertet');
}
```

## Consequences

### Positive

- **Defense in depth**: Two independent layers of protection
- **Privacy-preserving**: IP addresses stored as irreversible hashes
- **User-friendly**: Legitimate users get immediate feedback if already rated
- **Database integrity**: Transaction ensures atomic updates
- **Works with proxies**: Handles `x-forwarded-for` for Render.com deployment

### Negative

- **Not foolproof**: VPN/proxy users could circumvent IP check
- **localStorage clearable**: Users can clear browser data to re-rate
- **Same IP false positives**: Users on same network (NAT) share IP hash
- **Storage growth**: QuestionRating table grows with ratings (mitigated by unique constraint)

### Trade-offs Accepted

For a POC/fan project, this level of protection is sufficient. More robust solutions would require:
- User authentication (rejected in ADR-0006)
- Device fingerprinting (privacy concerns)
- CAPTCHA per rating (poor UX)

## Related

- ADR-0006: No Player Login (explains why we can't use authenticated ratings)
- ADR-0008: CAPTCHA for Submissions (similar spam protection pattern)
