import bcrypt from 'bcrypt';
import db from '../../config/db.js';
import { sendOTPEmail } from '../../config/mailer.js';

// Generate 6 digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/customer/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email wajib diisi' });

  try {
    // Cek email terdaftar sebagai customer
    const [users] = await db.query(
      'SELECT id FROM users WHERE email = ? AND role = ?',
      [email, 'customer']
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Email tidak terdaftar' });
    }

    // Hapus OTP lama untuk email ini
    await db.query('DELETE FROM password_reset_otps WHERE email = ?', [email]);

    // Generate OTP baru
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    // Simpan OTP ke database
    await db.query(
      'INSERT INTO password_reset_otps (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    // Kirim email
    await sendOTPEmail(email, otp);

    res.json({ message: 'Kode OTP telah dikirim ke email kamu' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/customer/auth/verify-otp
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email dan OTP wajib diisi' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM password_reset_otps WHERE email = ? AND used = 0 ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'OTP tidak ditemukan atau sudah digunakan' });
    }

    const otpData = rows[0];

    // Cek expired
    if (new Date() > new Date(otpData.expires_at)) {
      return res.status(400).json({ message: 'OTP sudah expired, minta kode baru' });
    }

    // Cek OTP cocok
    if (otpData.otp !== otp) {
      return res.status(400).json({ message: 'Kode OTP salah' });
    }

    // Tandai OTP sebagai verified (belum used, nanti dipakai saat reset)
    res.json({ message: 'OTP valid', email });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/customer/auth/reset-password
export const resetPassword = async (req, res) => {
  const { email, otp, new_password } = req.body;

  if (!email || !otp || !new_password) {
    return res.status(400).json({ message: 'Email, OTP, dan password baru wajib diisi' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ message: 'Password minimal 6 karakter' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM password_reset_otps WHERE email = ? AND used = 0 ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'OTP tidak ditemukan atau sudah digunakan' });
    }

    const otpData = rows[0];

    if (new Date() > new Date(otpData.expires_at)) {
      return res.status(400).json({ message: 'OTP sudah expired, minta kode baru' });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ message: 'Kode OTP salah' });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password user
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    // Tandai OTP sudah digunakan
    await db.query('UPDATE password_reset_otps SET used = 1 WHERE id = ?', [otpData.id]);

    res.json({ message: 'Password berhasil direset, silakan login' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
