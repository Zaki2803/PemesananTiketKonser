import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../config/db.js';

// POST /api/admin/auth/login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, 'admin']
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login admin berhasil',
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/auth/me
export const adminGetMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ? AND role = ?',
      [req.user.id, 'admin']
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Admin tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
