import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../config/db.js';

// POST /api/customer/auth/register
export const customerRegister = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, dan password wajib diisi' });
  }

  try {
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, 'customer']
    );

    res.status(201).json({ message: 'Registrasi berhasil', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/customer/auth/login
export const customerLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, 'customer']
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const customer = rows[0];
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { id: customer.id, name: customer.name, email: customer.email, role: customer.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: { id: customer.id, name: customer.name, email: customer.email, role: customer.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/customer/auth/me
export const customerGetMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ? AND role = ?',
      [req.user.id, 'customer']
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Customer tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
