import db from '../../config/db.js';
import fs from 'fs';

// GET /api/admin/events
export const getAllEvents = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.id, e.title, e.description, e.venue, e.city, e.genre,
             e.event_date, e.event_time, e.poster, e.status, e.created_at,
             a.id AS artist_id, a.name AS artist_name, a.photo AS artist_photo
      FROM events e
      JOIN artists a ON e.artist_id = a.id
      ORDER BY e.event_date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/events/:id
export const getEventById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, a.name AS artist_name, a.photo AS artist_photo
      FROM events e
      JOIN artists a ON e.artist_id = a.id
      WHERE e.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Event tidak ditemukan' });

    // Ambil ticket categories milik event ini
    const [categories] = await db.query(
      'SELECT * FROM ticket_categories WHERE event_id = ?',
      [req.params.id]
    );

    res.json({ ...rows[0], ticket_categories: categories });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/admin/events
export const createEvent = async (req, res) => {
  const { artist_id, title, description, venue, city, genre, event_date, event_time, status } = req.body;
  const poster = req.file ? req.file.path.replace(/\\/g, '/') : null;

  if (!artist_id || !title || !venue || !city || !event_date || !event_time) {
    return res.status(400).json({ message: 'Semua field wajib diisi kecuali deskripsi dan poster' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO events (artist_id, title, description, venue, city, genre, event_date, event_time, poster, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [artist_id, title, description || null, venue, city, genre || null, event_date, event_time, poster, status || 'open']
    );
    res.status(201).json({ message: 'Event berhasil ditambahkan', eventId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/admin/events/:id
export const updateEvent = async (req, res) => {
  const { artist_id, title, description, venue, city, genre, event_date, event_time, status } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Event tidak ditemukan' });

    let poster = existing[0].poster;
    if (req.file) {
      if (poster && fs.existsSync(poster)) fs.unlinkSync(poster);
      poster = req.file.path.replace(/\\/g, '/');
    }

    const e = existing[0];
    await db.query(
      `UPDATE events SET artist_id=?, title=?, description=?, venue=?, city=?, genre=?,
       event_date=?, event_time=?, poster=?, status=? WHERE id=?`,
      [
        artist_id || e.artist_id,
        title || e.title,
        description ?? e.description,
        venue || e.venue,
        city || e.city,
        genre !== undefined ? genre : e.genre,
        event_date || e.event_date,
        event_time || e.event_time,
        poster,
        status || e.status,
        req.params.id
      ]
    );

    res.json({ message: 'Event berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/admin/events/:id
export const deleteEvent = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Event tidak ditemukan' });

    if (existing[0].poster && fs.existsSync(existing[0].poster)) {
      fs.unlinkSync(existing[0].poster);
    }

    await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/admin/events/:id/status
export const updateEventStatus = async (req, res) => {
  const { status } = req.body;
  if (!['open', 'closed'].includes(status)) {
    return res.status(400).json({ message: 'Status harus open atau closed' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM events WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Event tidak ditemukan' });

    await db.query('UPDATE events SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Status event diubah menjadi ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
