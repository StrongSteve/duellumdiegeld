import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

// In-memory store for captcha challenges (simple implementation)
// In production, use Redis or similar for multi-instance deployments
interface CaptchaChallenge {
  answer: number;
  createdAt: number;
}

@Injectable()
export class CaptchaService {
  private challenges: Map<string, CaptchaChallenge> = new Map();
  private readonly CHALLENGE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Clean up expired challenges every minute
    setInterval(() => this.cleanupExpiredChallenges(), 60 * 1000);
  }

  /**
   * Generates a new math captcha challenge
   * Returns the challenge ID and the math problem to display
   */
  generateChallenge(): { challengeId: string; question: string } {
    // Generate two random numbers for a simple math problem
    const num1 = Math.floor(Math.random() * 20) + 1; // 1-20
    const num2 = Math.floor(Math.random() * 20) + 1; // 1-20

    // Randomly choose operation (addition or subtraction)
    const useAddition = Math.random() > 0.5;

    let question: string;
    let answer: number;

    if (useAddition) {
      question = `${num1} + ${num2}`;
      answer = num1 + num2;
    } else {
      // Ensure no negative results
      const [a, b] = num1 >= num2 ? [num1, num2] : [num2, num1];
      question = `${a} - ${b}`;
      answer = a - b;
    }

    // Generate unique challenge ID
    const challengeId = crypto.randomBytes(16).toString('hex');

    // Store the challenge
    this.challenges.set(challengeId, {
      answer,
      createdAt: Date.now(),
    });

    return { challengeId, question };
  }

  /**
   * Verifies a captcha response
   * @param token - Format: "challengeId:userAnswer"
   */
  async verifyCaptcha(token: string): Promise<boolean> {
    if (!token) {
      throw new BadRequestException('CAPTCHA token is required');
    }

    // Parse the token
    const parts = token.split(':');
    if (parts.length !== 2) {
      throw new BadRequestException('Invalid CAPTCHA token format');
    }

    const [challengeId, userAnswerStr] = parts;
    const userAnswer = parseInt(userAnswerStr, 10);

    if (isNaN(userAnswer)) {
      throw new BadRequestException('Invalid CAPTCHA answer');
    }

    // Get and remove the challenge (one-time use)
    const challenge = this.challenges.get(challengeId);
    this.challenges.delete(challengeId);

    if (!challenge) {
      throw new BadRequestException('CAPTCHA expired or invalid');
    }

    // Check if challenge is expired
    if (Date.now() - challenge.createdAt > this.CHALLENGE_TTL) {
      throw new BadRequestException('CAPTCHA expired');
    }

    // Verify the answer
    return challenge.answer === userAnswer;
  }

  /**
   * Removes expired challenges from memory
   */
  private cleanupExpiredChallenges(): void {
    const now = Date.now();
    for (const [id, challenge] of this.challenges.entries()) {
      if (now - challenge.createdAt > this.CHALLENGE_TTL) {
        this.challenges.delete(id);
      }
    }
  }
}
