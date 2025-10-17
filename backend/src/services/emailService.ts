import nodemailer from 'nodemailer'
import { envConfig } from '../config/env'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    try {
      // Check if email credentials are configured
      if (!envConfig.EMAIL_HOST || !envConfig.EMAIL_USER || !envConfig.EMAIL_PASSWORD) {
        console.warn('[EMAIL] Email service not configured. Emails will be logged to console.')
        return
      }

      this.transporter = nodemailer.createTransport({
        host: envConfig.EMAIL_HOST,
        port: envConfig.EMAIL_PORT || 587,
        secure: envConfig.EMAIL_PORT === 465, // true for 465, false for other ports
        auth: {
          user: envConfig.EMAIL_USER,
          pass: envConfig.EMAIL_PASSWORD,
        },
      })

      console.log('[EMAIL] Email service initialized successfully')
    } catch (error) {
      console.error('[EMAIL] Failed to initialize email service:', error)
    }
  }

  /**
   * Send verification email with magic link and 6-digit code
   */
  async sendVerificationEmail(email: string, code: string, name: string, token?: string): Promise<void> {
    const subject = 'Verify Your AgriYield Account'
    const magicLink = token ? `${envConfig.FRONTEND_URL}/verify?token=${token}` : undefined
    const html = this.getVerificationEmailTemplate(code, name, magicLink)
    const text = magicLink 
      ? `Hi ${name},\n\nClick this link to verify your AgriYield account:\n${magicLink}\n\nOr enter this code: ${code}\n\nThe link expires in 24 hours, the code expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe AgriYield Team`
      : `Hi ${name},\n\nYour AgriYield verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\nThe AgriYield Team`

    await this.sendEmail({
      to: email,
      subject,
      html,
      text,
    })
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(email: string, name: string, role: string): Promise<void> {
    const subject = 'Welcome to AgriYield! 🌾'
    const html = this.getWelcomeEmailTemplate(name, role)
    const text = `Hi ${name},\n\nWelcome to AgriYield! Your account has been successfully verified.\n\nYou can now access your ${role} dashboard and start your journey with us.\n\nBest regards,\nThe AgriYield Team`

    await this.sendEmail({
      to: email,
      subject,
      html,
      text,
    })
  }

  /**
   * Send generic email
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      if (!this.transporter) {
        // Email service not configured - log to console
        console.log('\n=================================')
        console.log('[EMAIL] Email would be sent to:', options.to)
        console.log('[EMAIL] Subject:', options.subject)
        console.log('[EMAIL] Content:', options.text || 'HTML email')
        console.log('=================================\n')
        return
      }

      const info = await this.transporter.sendMail({
        from: `"AgriYield" <${envConfig.EMAIL_FROM || envConfig.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      })

      console.log('[EMAIL] Email sent successfully:', info.messageId)
    } catch (error) {
      console.error('[EMAIL] Failed to send email:', error)
      throw new Error('Failed to send email')
    }
  }

  /**
   * Verification email HTML template with magic link
   */
  private getVerificationEmailTemplate(code: string, name: string, magicLink?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🌾 AgriYield</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Hi ${name},</h2>
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for signing up with AgriYield! To complete your registration, please verify your email address.
              </p>
              
              ${magicLink ? `
              <!-- Magic Link Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${magicLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                      ✨ Verify Email with Magic Link
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #6b7280; font-size: 14px; text-align: center;">
                This link expires in <strong>24 hours</strong>
              </p>
              
              <div style="margin: 30px 0; padding: 20px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
                <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 14px; text-align: center;">
                  Or enter this verification code manually:
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; border: 2px dashed #10b981;">
                      <div style="font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 6px; font-family: 'Courier New', monospace;">
                        ${code}
                      </div>
                    </td>
                  </tr>
                </table>
                <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 12px; text-align: center;">
                  Code expires in <strong>15 minutes</strong>
                </p>
              </div>
              ` : `
              <!-- Verification Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center" style="background-color: #f3f4f6; padding: 30px; border-radius: 8px; border: 2px dashed #10b981;">
                    <div style="font-size: 36px; font-weight: bold; color: #10b981; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${code}
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                This code will expire in <strong>15 minutes</strong>.
              </p>
              `}
              
              <p style="margin: 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you didn't create an account with AgriYield, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Empowering African agriculture through blockchain transparency
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} AgriYield. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }

  /**
   * Welcome email HTML template
   */
  private getWelcomeEmailTemplate(name: string, role: string): string {
    const dashboardUrl = role === 'farmer' 
      ? `${envConfig.FRONTEND_URL}/dashboard/farmer`
      : `${envConfig.FRONTEND_URL}/dashboard/investor`

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AgriYield</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 Welcome to AgriYield!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Hi ${name},</h2>
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Your email has been successfully verified! Welcome to the AgriYield community.
              </p>
              
              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                As a <strong>${role}</strong>, you now have access to:
              </p>
              
              <!-- Features -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                ${role === 'farmer' ? `
                <tr>
                  <td style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #10b981; margin-bottom: 10px;">
                    <strong style="color: #10b981;">✓</strong> Create and manage farm listings
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #10b981; margin-bottom: 10px;">
                    <strong style="color: #10b981;">✓</strong> Track funding progress
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #10b981;">
                    <strong style="color: #10b981;">✓</strong> Connect with investors
                  </td>
                </tr>
                ` : `
                <tr>
                  <td style="padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; margin-bottom: 10px;">
                    <strong style="color: #f59e0b;">✓</strong> Browse verified farm opportunities
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; margin-bottom: 10px;">
                    <strong style="color: #f59e0b;">✓</strong> Track your investments
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
                    <strong style="color: #f59e0b;">✓</strong> Earn competitive returns
                  </td>
                </tr>
                `}
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Empowering African agriculture through blockchain transparency
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} AgriYield. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }
}

export const emailService = new EmailService()
export default emailService
