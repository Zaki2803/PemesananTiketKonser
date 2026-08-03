import db from '../../config/db.js';

// GET /api/customer/events  — list semua event yang open
export const getAllEvents = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.id, e.title, e.description, e.venue, e.city,
             e.event_date, e.event_time, e.poster, e.status,
             a.name AS artist_name, a.photo AS artist_photo
      FROM events e
      JOIN artists a ON e.artist_id = a.id
      WHERE e.status = 'open'
      ORDER BY e.event_date ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/customer/events/:id  — detail event + kategori tiket
export const getEventById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, a.name AS artist_name, a.photo AS artist_photo, a.description AS artist_description
      FROM events e
      JOIN artists a ON e.artist_id = a.id
      WHERE e.id = ? AND e.status = 'open'
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Event tidak ditemukan atau sudah ditutup' });
    }

    const [categories] = await db.query(
      'SELECT id, name, price, quota, remaining_quota FROM ticket_categories WHERE event_id = ?',
      [req.params.id]
    );

    res.json({ ...rows[0], ticket_categories: categories });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
