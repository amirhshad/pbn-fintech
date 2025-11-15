import twilio from 'twilio';
import { logger } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

export class SmsService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

    // Check if credentials are configured and not placeholder values
    const isConfigured = accountSid &&
                        authToken &&
                        this.fromNumber &&
                        !accountSid.startsWith('your-') &&
                        !authToken.startsWith('your-');

    if (!isConfigured) {
      logger.warn('Twilio credentials not configured. SMS service will be in test mode.');
      this.client = null as any; // Test mode
    } else {
      this.client = twilio(accountSid, authToken);
    }
  }

  // Send phone verification code
  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    const message = `Your PBN Fintech verification code is: ${code}. This code expires in 10 minutes.`;

    // Test mode for development
    if (!this.client) {
      logger.info(`[TEST MODE] SMS to ${phoneNumber}: ${message}`);
      return;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber,
      });

      logger.info(`SMS sent successfully to ${phoneNumber}, SID: ${result.sid}`);
    } catch (error: any) {
      logger.error(`Failed to send SMS to ${phoneNumber}:`, error.message);
      throw new CustomError('Failed to send SMS', 500);
    }
  }

  // Send transaction notification
  async sendTransactionNotification(
    phoneNumber: string,
    type: 'match_found' | 'transaction_completed' | 'dispute_resolved',
    details: any
  ): Promise<void> {
    let message = '';

    switch (type) {
      case 'match_found':
        message = `PBN Fintech: You've been matched for €${details.amount} cash exchange! Check the app for details.`;
        break;
      case 'transaction_completed':
        message = `PBN Fintech: Your €${details.amount} transaction has been completed successfully. Rate your experience!`;
        break;
      case 'dispute_resolved':
        message = `PBN Fintech: Your dispute has been resolved. Check the app for more details.`;
        break;
      default:
        message = 'PBN Fintech: You have a new notification. Check the app for details.';
    }

    // Test mode for development
    if (!this.client) {
      logger.info(`[TEST MODE] Notification SMS to ${phoneNumber}: ${message}`);
      return;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber,
      });

      logger.info(`Notification SMS sent to ${phoneNumber}, SID: ${result.sid}`);
    } catch (error: any) {
      logger.error(`Failed to send notification SMS to ${phoneNumber}:`, error.message);
      // Don't throw error for notifications - they're not critical
    }
  }

  // Send security alert
  async sendSecurityAlert(
    phoneNumber: string,
    alertType: 'new_device_login' | 'suspicious_activity' | 'account_locked'
  ): Promise<void> {
    let message = '';

    switch (alertType) {
      case 'new_device_login':
        message = 'PBN Fintech Security Alert: Your account was accessed from a new device. If this wasn\'t you, contact support immediately.';
        break;
      case 'suspicious_activity':
        message = 'PBN Fintech Security Alert: Suspicious activity detected on your account. Please secure your account and contact support.';
        break;
      case 'account_locked':
        message = 'PBN Fintech Security Alert: Your account has been temporarily locked for security reasons. Contact support to unlock.';
        break;
    }

    // Always send security alerts, even in test mode
    if (!this.client) {
      logger.warn(`[TEST MODE] SECURITY ALERT to ${phoneNumber}: ${message}`);
      return;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber,
      });

      logger.info(`Security alert SMS sent to ${phoneNumber}, SID: ${result.sid}`);
    } catch (error: any) {
      logger.error(`Failed to send security alert to ${phoneNumber}:`, error.message);
      throw new CustomError('Failed to send security alert', 500);
    }
  }

  // Validate phone number format
  static isValidDutchPhoneNumber(phoneNumber: string): boolean {
    const dutchPhoneRegex = /^\+31[0-9]{9}$/;
    return dutchPhoneRegex.test(phoneNumber);
  }

  // Format phone number to international format
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove any spaces, dashes, or other formatting
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Handle different Dutch number formats
    if (cleaned.startsWith('0')) {
      // Convert 0612345678 to +31612345678
      return '+31' + cleaned.substring(1);
    } else if (cleaned.startsWith('31')) {
      // Convert 31612345678 to +31612345678
      return '+' + cleaned;
    } else if (cleaned.startsWith('+31')) {
      // Already in correct format
      return cleaned;
    }
    
    // Assume it's already a mobile number without country code
    return '+31' + cleaned;
  }
}