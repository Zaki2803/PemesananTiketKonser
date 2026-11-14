import db from '../../config/db.js';

// GET /api/customer/events  — list semua event yang open
export const getAllEvents = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.id, e.title, e.description, e.venue, e.city, e.genre,
             e.event_date, e.event_time, e.poster, e.status,
             a.name AS artist_name, a.photo AS artist_photo,
             MIN(tc.price) AS min_price
      FROM events e
      JOIN artists a ON e.artist_id = a.id
      LEFT JOIN ticket_categories tc ON tc.event_id = e.id
      WHERE e.status = 'open'
      GROUP BY e.id
      ORDER BY e.event_date ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi error di server', error: err.message });
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
      return res.status(404).json({ message: 'Event tidak ditemukan atau sudah selesai' });
    }

    const [categories] = await db.query(
      'SELECT id, name, benefits, price, quota, remaining_quota FROM ticket_categories WHERE event_id = ? ORDER BY price ASC',
      [req.params.id]
    );

    res.json({ ...rows[0], ticket_categories: categories });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi error di server', error: err.message });
  }
};
