import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export type EmailTemplate =
  | 'welcome'
  | 'reset-password'
  | 'assignment-due'
  | 'grade-posted'
  | 'live-session-reminder';

interface SendEmailOptions {
  to: string;
  subject: string;
  template: EmailTemplate;
  context: Record<string, unknown>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    const port = config.get<number>('SMTP_PORT', 587);
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      this.logger.warn('SMTP not configured — emails will be logged only');
    }
  }

  async send(options: SendEmailOptions): Promise<void> {
    const html = this.renderTemplate(options.template, options.context);

    if (!this.transporter) {
      this.logger.debug(`[EMAIL SKIPPED] To: ${options.to} | Subject: ${options.subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM', '"EduAI" <no-reply@eduai.com>'),
        to: options.to,
        subject: options.subject,
        html,
      });
      this.logger.log(`Email sent to ${options.to}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${options.to}`, err);
    }
  }

  private renderTemplate(template: EmailTemplate, ctx: Record<string, unknown>): string {
    switch (template) {
      case 'welcome':
        return `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#2563eb,#16a34a);padding:40px;text-align:center;border-radius:12px 12px 0 0">
              <h1 style="color:#fff;margin:0;font-size:28px">Welcome to EduAI!</h1>
            </div>
            <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px">
              <p style="color:#374151;font-size:16px">Hi ${ctx.firstName},</p>
              <p style="color:#6b7280">Your account has been created successfully. You can now log in and start learning.</p>
              <a href="${ctx.loginUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">Go to Dashboard</a>
              <p style="color:#9ca3af;font-size:12px;margin-top:32px">If you didn't create this account, please ignore this email.</p>
            </div>
          </div>`;

      case 'reset-password':
        return `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#1e40af;padding:32px;text-align:center;border-radius:12px 12px 0 0">
              <h1 style="color:#fff;margin:0;font-size:24px">Reset Your Password</h1>
            </div>
            <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px">
              <p style="color:#374151">Hi ${ctx.firstName},</p>
              <p style="color:#6b7280">Click the button below to reset your password. This link expires in 1 hour.</p>
              <a href="${ctx.resetUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">Reset Password</a>
              <p style="color:#9ca3af;font-size:12px;margin-top:32px">If you didn't request this, you can safely ignore this email.</p>
            </div>
          </div>`;

      case 'assignment-due':
        return `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#d97706;padding:32px;text-align:center;border-radius:12px 12px 0 0">
              <h1 style="color:#fff;margin:0;font-size:22px">Assignment Due Soon</h1>
            </div>
            <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px">
              <p style="color:#374151">Hi ${ctx.studentName},</p>
              <p style="color:#6b7280"><strong>${ctx.assignmentTitle}</strong> is due on <strong>${ctx.dueDate}</strong>.</p>
              <a href="${ctx.assignmentUrl}" style="display:inline-block;background:#d97706;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">Submit Assignment</a>
            </div>
          </div>`;

      case 'grade-posted':
        return `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#16a34a;padding:32px;text-align:center;border-radius:12px 12px 0 0">
              <h1 style="color:#fff;margin:0;font-size:22px">Grade Posted</h1>
            </div>
            <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px">
              <p style="color:#374151">Hi ${ctx.studentName},</p>
              <p style="color:#6b7280">Your grade for <strong>${ctx.assignmentTitle}</strong> has been posted.</p>
              <p style="font-size:32px;font-weight:bold;color:#16a34a;text-align:center;margin:24px 0">${ctx.score}%</p>
              <a href="${ctx.assignmentUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">View Feedback</a>
            </div>
          </div>`;

      case 'live-session-reminder':
        return `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#7c3aed;padding:32px;text-align:center;border-radius:12px 12px 0 0">
              <h1 style="color:#fff;margin:0;font-size:22px">Live Class Starting Soon</h1>
            </div>
            <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px">
              <p style="color:#374151">Hi ${ctx.studentName},</p>
              <p style="color:#6b7280"><strong>${ctx.sessionTitle}</strong> starts in 15 minutes.</p>
              <p style="color:#6b7280">Teacher: ${ctx.teacherName}</p>
              <a href="${ctx.sessionUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">Join Class</a>
            </div>
          </div>`;

      default:
        return `<p>${JSON.stringify(ctx)}</p>`;
    }
  }
}
