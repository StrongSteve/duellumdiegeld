import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class StartupService {
  private readonly logger = new Logger(StartupService.name);

  private _adminPassword: string;
  private _jwtSecret: string;

  constructor() {
    // Generate new credentials on every startup
    this._adminPassword = this.generateSecurePassword(32);
    this._jwtSecret = this.generateSecurePassword(64);

    this.logCredentials();
  }

  private generateSecurePassword(length: number): string {
    // Generate URL-safe base64 string
    const bytes = crypto.randomBytes(Math.ceil(length * 0.75));
    return bytes.toString('base64url').slice(0, length);
  }

  private logCredentials(): void {
    const separator = '═'.repeat(70);
    const innerSeparator = '─'.repeat(70);

    this.logger.warn('');
    this.logger.warn(separator);
    this.logger.warn('');
    this.logger.warn('   🔐  ADMIN CREDENTIALS - GENERATED ON STARTUP  🔐');
    this.logger.warn('');
    this.logger.warn(innerSeparator);
    this.logger.warn('');
    this.logger.warn('   Username:  admin');
    this.logger.warn(`   Password:  ${this._adminPassword}`);
    this.logger.warn('');
    this.logger.warn(innerSeparator);
    this.logger.warn('');
    this.logger.warn('   ⚠️  WICHTIG: Diese Zugangsdaten werden bei jedem');
    this.logger.warn('   Neustart neu generiert! Bitte notieren.');
    this.logger.warn('');
    this.logger.warn(separator);
    this.logger.warn('');
    this.logger.warn(separator);
    this.logger.warn('');
    this.logger.warn('   🔑  JWT SECRET - GENERATED ON STARTUP  🔑');
    this.logger.warn('');
    this.logger.warn(innerSeparator);
    this.logger.warn('');
    this.logger.warn(`   JWT_SECRET=${this._jwtSecret}`);
    this.logger.warn('');
    this.logger.warn(innerSeparator);
    this.logger.warn('');
    this.logger.warn('   ⚠️  Alle bestehenden JWT-Tokens werden ungültig!');
    this.logger.warn('');
    this.logger.warn(separator);
    this.logger.warn('');
  }

  get adminPassword(): string {
    return this._adminPassword;
  }

  get jwtSecret(): string {
    return this._jwtSecret;
  }
}
