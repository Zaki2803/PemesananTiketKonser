import db from '../../config/db.js';

// GET /api/admin/payments
export const getAllPayments = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.order_id, p.payment_method, p.transaction_id,
             p.transaction_status, p.status, p.verified_at,
             o.total_price, o.payment_status AS order_status, o.order_date,
             u.name AS customer_name, u.email AS customer_email,
             e.title AS event_title
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN events e ON o.event_id = e.id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/payments/:id
export const getPaymentById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.order_id, p.payment_method, p.transaction_id,
             p.transaction_status, p.status, p.verified_at,
             o.total_price, o.payment_status AS order_status, o.order_date,
             u.name AS customer_name, u.email AS customer_email,
             e.title AS event_title, e.event_date, e.venue
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN events e ON o.event_id = e.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Payment tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
