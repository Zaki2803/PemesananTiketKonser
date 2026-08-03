import db from '../../config/db.js';

// GET /api/admin/payments
export const getAllPayments = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, o.total_price, u.name AS customer_name, e.title AS event_title,
             a.name AS verified_by_name
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN events e ON o.event_id = e.id
      LEFT JOIN users a ON p.verified_by = a.id
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
      SELECT p.*, o.total_price, u.name AS customer_name, e.title AS event_title,
             a.name AS verified_by_name
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN events e ON o.event_id = e.id
      LEFT JOIN users a ON p.verified_by = a.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Payment tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/admin/payments/:id/verify
export const verifyPayment = async (req, res) => {
  const { status } = req.body; // 'verified' atau 'rejected'

  if (!['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status harus verified atau rejected' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [payments] = await conn.query('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    if (payments.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Payment tidak ditemukan' });
    }

    const payment = payments[0];
    if (payment.status !== 'pending') {
      await conn.rollback();
      return res.status(400).json({ message: 'Payment sudah diproses sebelumnya' });
    }

    // Update status payment
    await conn.query(
      'UPDATE payments SET status=?, verified_by=?, verified_at=NOW() WHERE id=?',
      [status, req.user.id, req.params.id]
    );

    // Update status order sesuai hasil verifikasi
    const orderStatus = status === 'verified' ? 'paid' : 'rejected';
    await conn.query(
      'UPDATE orders SET payment_status=? WHERE id=?',
      [orderStatus, payment.order_id]
    );

    // Jika rejected, kembalikan remaining_quota
    if (status === 'rejected') {
      const [items] = await conn.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [payment.order_id]
      );
      for (const item of items) {
        await conn.query(
          'UPDATE ticket_categories SET remaining_quota = remaining_quota + ? WHERE id = ?',
          [item.quantity, item.ticket_category_id]
        );
      }
    }

    await conn.commit();
    res.json({ message: `Payment berhasil di-${status}` });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    conn.release();
  }
};
