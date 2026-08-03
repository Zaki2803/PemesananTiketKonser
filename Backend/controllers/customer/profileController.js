import bcrypt from 'bcrypt';
import db from '../../config/db.js';

// GET /api/customer/profile
export const getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/customer/profile
export const updateProfile = async (req, res) => {
  const { name, phone } = req.body;

  try {
    const [rows] = await db.query('SELECT id FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });

    await db.query(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name || req.user.name, phone || null, req.user.id]
    );

    res.json({ message: 'Profil berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/customer/profile/password
export const updatePassword = async (req, res) => {
  const { old_password, new_password } = req.body;

  if (!old_password || !new_password) {
    return res.status(400).json({ message: 'Password lama dan baru wajib diisi' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
  }

  try {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });

    const isMatch = await bcrypt.compare(old_password, rows[0].password);
    if (!isMatch) return res.status(401).json({ message: 'Password lama tidak sesuai' });

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    res.json({ message: 'Password berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
