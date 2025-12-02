# ADR 0008: CAPTCHA for Public Question Submissions

## Status
Accepted

## Context
The public question submission is accessible without login. We need to protect against:
- Spam submissions
- Bots and automated attacks
- Abusive content

## Decision
We use a **local math CAPTCHA** for question submissions.

### Reasons:
1. **Spam protection**: Prevents automated submissions
2. **Privacy**: No external services, GDPR compliant
3. **Simple implementation**: Server-generated math challenge
4. **No dependencies**: Works offline, no API keys needed
5. **Free**: No cost, no rate limits

### Implementation:
- Frontend: Displays math question (e.g., "What is 7 + 5?")
- Backend: Generates challenge, validates answer
- Challenge expires after 5 minutes
- Server-side validation prevents bypass

### Configuration:
```env
# No external configuration needed
# Math CAPTCHA is fully self-contained
```

### Alternatives considered:
- **hCaptcha/reCAPTCHA**: External dependency, privacy concerns
- **Honeypot fields**: Too easy to bypass
- **Rate limiting only**: Not sufficient against distributed attacks

## Consequences

### Positive
- Effective protection against simple bots
- No privacy concerns (no external tracking)
- Works offline
- No API keys to manage

### Negative
- Less effective against sophisticated bots than hCaptcha/reCAPTCHA
- Simple math can be solved programmatically
- Users must solve a math problem

### Neutral
- Acceptable trade-off for a POC
- Can be upgraded to hCaptcha later if needed
