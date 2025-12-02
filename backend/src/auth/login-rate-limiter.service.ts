import { Injectable } from '@nestjs/common';

interface LoginAttempt {
  failedAttempts: number;
  lastFailedAt: number;
  lockedUntil: number | null;
}

@Injectable()
export class LoginRateLimiterService {
  // In-memory store for login attempts (use Redis for multi-instance deployments)
  private attempts: Map<string, LoginAttempt> = new Map();

  // Base lockout time in seconds (5 seconds after first failure)
  private readonly BASE_LOCKOUT_SECONDS = 5;

  // Multiplier for exponential backoff (5s, 50s, 500s, etc.)
  private readonly LOCKOUT_MULTIPLIER = 10;

  // Max lockout time (1 hour)
  private readonly MAX_LOCKOUT_SECONDS = 3600;

  // Time after which failed attempts are reset (1 hour)
  private readonly RESET_AFTER_SECONDS = 3600;

  constructor() {
    // Clean up old entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  /**
   * Check if a login attempt is allowed for the given identifier (IP or username)
   * Returns { allowed: true } or { allowed: false, retryAfter: seconds, message: string }
   */
  checkAttempt(identifier: string): {
    allowed: boolean;
    retryAfter?: number;
    message?: string;
  } {
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      return { allowed: true };
    }

    const now = Date.now();

    // Check if lockout has expired
    if (attempt.lockedUntil && now < attempt.lockedUntil) {
      const retryAfter = Math.ceil((attempt.lockedUntil - now) / 1000);
      return {
        allowed: false,
        retryAfter,
        message: this.formatLockoutMessage(retryAfter),
      };
    }

    // Check if we should reset the attempts (after RESET_AFTER_SECONDS of no activity)
    if (now - attempt.lastFailedAt > this.RESET_AFTER_SECONDS * 1000) {
      this.attempts.delete(identifier);
      return { allowed: true };
    }

    return { allowed: true };
  }

  /**
   * Record a failed login attempt and apply lockout if necessary
   * Returns the lockout info
   */
  recordFailedAttempt(identifier: string): {
    lockedOut: boolean;
    retryAfter?: number;
    message?: string;
  } {
    const now = Date.now();
    let attempt = this.attempts.get(identifier);

    if (!attempt) {
      attempt = {
        failedAttempts: 0,
        lastFailedAt: now,
        lockedUntil: null,
      };
    }

    attempt.failedAttempts++;
    attempt.lastFailedAt = now;

    // Calculate lockout time: 5s, 50s, 500s, etc. (exponential backoff)
    // First failure = 5s, second = 50s, third = 500s, etc.
    const lockoutSeconds = Math.min(
      this.BASE_LOCKOUT_SECONDS *
        Math.pow(this.LOCKOUT_MULTIPLIER, attempt.failedAttempts - 1),
      this.MAX_LOCKOUT_SECONDS,
    );

    attempt.lockedUntil = now + lockoutSeconds * 1000;
    this.attempts.set(identifier, attempt);

    return {
      lockedOut: true,
      retryAfter: lockoutSeconds,
      message: this.formatLockoutMessage(lockoutSeconds),
    };
  }

  /**
   * Clear failed attempts after successful login
   */
  clearAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Format the lockout message in German
   */
  private formatLockoutMessage(seconds: number): string {
    if (seconds < 60) {
      return `Zu viele fehlgeschlagene Anmeldeversuche. Bitte warten Sie ${seconds} Sekunden.`;
    } else if (seconds < 3600) {
      const minutes = Math.ceil(seconds / 60);
      return `Zu viele fehlgeschlagene Anmeldeversuche. Bitte warten Sie ${minutes} Minute${minutes > 1 ? 'n' : ''}.`;
    } else {
      const hours = Math.ceil(seconds / 3600);
      return `Zu viele fehlgeschlagene Anmeldeversuche. Bitte warten Sie ${hours} Stunde${hours > 1 ? 'n' : ''}.`;
    }
  }

  /**
   * Clean up old entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, attempt] of this.attempts.entries()) {
      // Remove entries that haven't had activity in RESET_AFTER_SECONDS
      if (now - attempt.lastFailedAt > this.RESET_AFTER_SECONDS * 1000) {
        this.attempts.delete(key);
      }
    }
  }
}
