import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Konser Ticket" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Kode OTP Reset Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333;">Reset Password</h2>
        <p>Kamu menerima email ini karena ada permintaan reset password untuk akun kamu.</p>
        <p>Gunakan kode OTP berikut:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6C63FF; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p>Kode ini berlaku selama <strong>5 menit</strong>.</p>
        <p>Jika kamu tidak meminta reset password, abaikan email ini.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Konser Ticket App</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export default transporter;
