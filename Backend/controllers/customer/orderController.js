import db from '../../config/db.js';

// GET /api/customer/orders  — riwayat order milik customer
export const getMyOrders = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.id, o.total_price, o.payment_status, o.order_date,
             e.title AS event_title, e.event_date, e.venue, e.city, e.poster
      FROM orders o
      JOIN events e ON o.event_id = e.id
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/customer/orders/:id  — detail order milik customer
export const getMyOrderById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.*, e.title AS event_title, e.event_date, e.venue, e.city, e.poster
      FROM orders o
      JOIN events e ON o.event_id = e.id
      WHERE o.id = ? AND o.user_id = ?
    `, [req.params.id, req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    const [items] = await db.query(`
      SELECT oi.quantity, oi.price, oi.subtotal, tc.name AS category_name
      FROM order_items oi
      JOIN ticket_categories tc ON oi.ticket_category_id = tc.id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    const [payment] = await db.query(
      'SELECT id, payment_method, payment_proof, status, verified_at FROM payments WHERE order_id = ?',
      [req.params.id]
    );

    res.json({ ...rows[0], items, payment: payment[0] || null });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/customer/orders  — buat order baru
export const createOrder = async (req, res) => {
  const { event_id, items } = req.body;
  // items: [{ ticket_category_id, quantity }]

  if (!event_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'event_id dan items wajib diisi' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Cek event masih open
    const [events] = await conn.query(
      'SELECT id FROM events WHERE id = ? AND status = ?',
      [event_id, 'open']
    );
    if (events.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Event tidak tersedia atau sudah ditutup' });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const { ticket_category_id, quantity } = item;

      if (!ticket_category_id || !quantity || quantity < 1) {
        await conn.rollback();
        return res.status(400).json({ message: 'ticket_category_id dan quantity wajib diisi' });
      }

      const [categories] = await conn.query(
        'SELECT * FROM ticket_categories WHERE id = ? AND event_id = ? FOR UPDATE',
        [ticket_category_id, event_id]
      );

      if (categories.length === 0) {
        await conn.rollback();
        return res.status(404).json({ message: `Kategori tiket ${ticket_category_id} tidak ditemukan` });
      }

      const cat = categories[0];
      if (cat.remaining_quota < quantity) {
        await conn.rollback();
        return res.status(400).json({ message: `Kuota tidak cukup untuk kategori ${cat.name}` });
      }

      const subtotal = cat.price * quantity;
      totalPrice += subtotal;
      orderItems.push({ ticket_category_id, quantity, price: cat.price, subtotal });

      // Kurangi remaining_quota
      await conn.query(
        'UPDATE ticket_categories SET remaining_quota = remaining_quota - ? WHERE id = ?',
        [quantity, ticket_category_id]
      );
    }

    // Buat order
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, event_id, total_price, payment_status) VALUES (?, ?, ?, ?)',
      [req.user.id, event_id, totalPrice, 'pending']
    );

    const orderId = orderResult.insertId;

    // Simpan order items
    for (const item of orderItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, ticket_category_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.ticket_category_id, item.quantity, item.price, item.subtotal]
      );
    }

    await conn.commit();
    res.status(201).json({
      message: 'Order berhasil dibuat, silakan lakukan pembayaran',
      order_id: orderId,
      total_price: totalPrice
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    conn.release();
  }
};

// DELETE /api/customer/orders/:id  — cancel order (hanya jika masih pending)
export const cancelOrder = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    if (rows[0].payment_status !== 'pending') {
      await conn.rollback();
      return res.status(400).json({ message: 'Hanya order dengan status pending yang bisa dibatalkan' });
    }

    // Kembalikan remaining_quota
    const [items] = await conn.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [req.params.id]
    );
    for (const item of items) {
      await conn.query(
        'UPDATE ticket_categories SET remaining_quota = remaining_quota + ? WHERE id = ?',
        [item.quantity, item.ticket_category_id]
      );
    }

    await conn.query(
      'UPDATE orders SET payment_status = ? WHERE id = ?',
      ['cancelled', req.params.id]
    );

    await conn.commit();
    res.json({ message: 'Order berhasil dibatalkan' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    conn.release();
  }
};
