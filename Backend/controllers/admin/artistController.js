import db from '../../config/db.js';
import fs from 'fs';

// GET /api/admin/artists
export const getAllArtists = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM artists ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/artists/:id
export const getArtistById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM artists WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Artist tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/admin/artists
export const createArtist = async (req, res) => {
  const { name, description } = req.body;
  const photo = req.file ? req.file.path.replace(/\\/g, '/') : null;

  if (!name) return res.status(400).json({ message: 'Nama artist wajib diisi' });

  try {
    const [result] = await db.query(
      'INSERT INTO artists (name, description, photo) VALUES (?, ?, ?)',
      [name, description || null, photo]
    );
    res.status(201).json({ message: 'Artist berhasil ditambahkan', artistId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/admin/artists/:id
export const updateArtist = async (req, res) => {
  const { name, description } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM artists WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Artist tidak ditemukan' });

    let photo = existing[0].photo;

    // Jika ada file baru, hapus foto lama
    if (req.file) {
      if (photo && fs.existsSync(photo)) fs.unlinkSync(photo);
      photo = req.file.path.replace(/\\/g, '/');
    }

    await db.query(
      'UPDATE artists SET name = ?, description = ?, photo = ? WHERE id = ?',
      [name || existing[0].name, description ?? existing[0].description, photo, req.params.id]
    );

    res.json({ message: 'Artist berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/admin/artists/:id
export const deleteArtist = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM artists WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Artist tidak ditemukan' });

    // Hapus foto jika ada
    if (existing[0].photo && fs.existsSync(existing[0].photo)) {
      fs.unlinkSync(existing[0].photo);
    }

    await db.query('DELETE FROM artists WHERE id = ?', [req.params.id]);
    res.json({ message: 'Artist berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
