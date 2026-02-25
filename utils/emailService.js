const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,       // Your Gmail address in .env
            pass: process.env.EMAIL_APP_PASS,   // Gmail App Password in .env
        },
    });
};

/**
 * Send OTP email for password reset
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit OTP
 */
const sendOtpEmail = async (toEmail, otp) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"KBC Community App" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Your Password Reset OTP - KBC Community',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">KBC Community</h1>
                <p style="color: #dcfce7; margin: 8px 0 0 0;">Password Reset Request</p>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
                <p style="color: #374151; font-size: 16px; margin-top: 0;">Hello,</p>
                <p style="color: #374151; font-size: 15px;">We received a request to reset your password. Use the OTP below to proceed:</p>
                <div style="background: white; border: 2px dashed #22c55e; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your OTP</p>
                    <span style="font-size: 42px; font-weight: bold; color: #16a34a; letter-spacing: 10px;">${otp}</span>
                </div>
                <p style="color: #6b7280; font-size: 13px; text-align: center;">⏱ This OTP is valid for <strong>10 minutes</strong>.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
        </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] OTP email sent to ${toEmail}. Message ID: ${info.messageId}`);
    return info;
};

module.exports = { sendOtpEmail };
