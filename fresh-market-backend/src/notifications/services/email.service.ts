// src/notifications/services/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { Order } from '../../common/entities/order.entity'; // Import Order entity
import { OrderStatus } from '../../common/enums/order-status.enum'; // Import OrderStatus enum

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private readonly senderEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('resend.apiKey');
    this.senderEmail = this.configService.get<string>('resend.senderEmail') || 'Fresh Market <onboarding@resend.dev>';

    if (!apiKey) {
      this.logger.error('Resend API key is not configured. Email sending will be disabled.');
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`Email not sent to ${to}: Resend API key missing.`);
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.senderEmail,
        to: [to],
        subject: subject,
        html: html,
        text: text,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${to}:`, error);
        throw new Error(`Resend API error: ${error.message}`);
      }
      this.logger.log(`Email sent successfully to ${to}. ID: ${data.id}`);
    } catch (err) {
      this.logger.error(`Error sending email to ${to}:`, err);
      // It's often better to log the error and not re-throw here
      // so the main application flow isn't interrupted by email failures.
      // throw err; // Only re-throw if email sending is critical to the transaction.
    }
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    const subject = 'Welcome to Fresh Market!';
    const html = `<p>Hello ${userName},</p>
                  <p>Welcome to Fresh Market, your platform for fresh local fruits!</p>
                  <p>We're excited to have you onboard.</p>
                  <p>Best regards,<br>The Fresh Market Team</p>`;
    const text = `Hello ${userName},\nWelcome to Fresh Market, your platform for fresh local fruits!\nWe're excited to have you onboard.\nBest regards,\nThe Fresh Market Team`;
    await this.sendEmail(to, subject, html, text);
  }

  async sendPasswordResetEmail(to: string, userName: string, resetLink: string): Promise<void> {
    const subject = 'Fresh Market: Password Reset Request';
    const html = `<p>Hello ${userName},</p>
                  <p>You have requested to reset your password for your Fresh Market account.</p>
                  <p>Please click on the following link to reset your password:</p>
                  <p><a href="${resetLink}">Reset My Password</a></p>
                  <p>This link will expire in 1 hour.</p>
                  <p>If you did not request this, please ignore this email.</p>
                  <p>Best regards,<br>The Fresh Market Team</p>`;
    const text = `Hello ${userName},\nYou have requested to reset your password for your Fresh Market account.\nPlease use the following link to reset your password: ${resetLink}\nThis link will expire in 1 hour.\nIf you did not request this, please ignore this email.\nBest regards,\nThe Fresh Market Team`;
    await this.sendEmail(to, subject, html, text);
  }

  async sendPasswordChangeConfirmationEmail(to: string, userName: string): Promise<void> {
    const subject = 'Fresh Market: Your Password Has Been Changed';
    const html = `<p>Hello ${userName},</p>
                  <p>This is a confirmation that the password for your Fresh Market account has been successfully changed.</p>
                  <p>If you did not make this change, please contact support immediately.</p>
                  <p>Best regards,<br>The Fresh Market Team</p>`;
    const text = `Hello ${userName},\nThis is a confirmation that the password for your Fresh Market account has been successfully changed.\nIf you did not make this change, please contact support immediately.\nBest regards,\nThe Fresh Market Team`;
    await this.sendEmail(to, subject, html, text);
  }

  async sendOrderConfirmationEmail(to: string, userName: string, order: Order): Promise<void> {
    const subject = `Fresh Market: Your Order #${order.id.substring(0, 8)} Confirmed!`;
    const orderItemsHtml = order.orderItems.map(item => `<li>${item.quantity} x ${item.product ? item.product.name : 'Unknown Product'} (${item.priceAtOrder} RWF each)</li>`).join('');

    const html = `<p>Hello ${userName},</p>
                  <p>Thank you for your order from <b>${order.shop ? order.shop.name : 'your chosen shop'}</b>!</p>
                  <p>Your order <b>#${order.id.substring(0, 8)}</b> has been confirmed and is currently <b>${order.status.toUpperCase()}</b>.</p>
                  <p><b>Order Details:</b></p>
                  <ul>
                    ${orderItemsHtml}
                  </ul>
                  <p><b>Total Price:</b> ${order.total_amount} RWF</p>
                  <p><b>Shipping Address:</b> ${order.deliveryAddress}</p>
                  <p>We will notify you when your order status changes.</p>
                  <p>Best regards,<br>The Fresh Market Team</p>`;

    const text = `Hello ${userName},\nThank you for your order from ${order.shop ? order.shop.name : 'your chosen shop'}!\nYour order #${order.id.substring(0, 8)} has been confirmed and is currently ${order.status.toUpperCase()}.\nOrder Details:\n${order.orderItems.map(item => `${item.quantity} x ${item.product ? item.product.name : 'Unknown Product'} (${item.priceAtOrder} RWF each)`).join('\n')}\nTotal Price: ${order.total_amount} RWF\nShipping Address: ${order.deliveryAddress}\nWe will notify you when your order status changes.\nBest regards,\nThe Fresh Market Team`;

    await this.sendEmail(to, subject, html, text);
  }

  async sendOrderStatusUpdateEmail(to: string, userName: string, order: Order): Promise<void> {
    const subject = `Fresh Market: Order #${order.id.substring(0, 8)} Status Update - ${order.status.toUpperCase()}`;

    const html = `<p>Hello ${userName},</p>
                  <p>Good news! The status of your order <b>#${order.id.substring(0, 8)}</b> from <b>${order.shop ? order.shop.name : 'your chosen shop'}</b> has been updated.</p>
                  <p>New Status: <b>${order.status.toUpperCase()}</b></p>
                  <p>You can view your order details by logging into your Fresh Market account.</p>
                  <p>Best regards,<br>The Fresh Market Team</p>`;

    const text = `Hello ${userName},\nGood news! The status of your order #${order.id.substring(0, 8)} from ${order.shop ? order.shop.name : 'your chosen shop'} has been updated.\nNew Status: ${order.status.toUpperCase()}\nYou can view your order details by logging into your Fresh Market account.\nBest regards,\nThe Fresh Market Team`;

    await this.sendEmail(to, subject, html, text);
  }
}