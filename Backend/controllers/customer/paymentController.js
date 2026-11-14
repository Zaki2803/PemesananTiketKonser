import db from '../../config/db.js';
import { snap } from '../../config/midtrans.js';

// POST /api/customer/payments/create  — buat transaksi Midtrans
export const createPayment = async (req, res) => {
  const { order_id } = req.body;

  if (!order_id) return res.status(400).json({ message: 'order_id wajib diisi' });

  try {
    // Ambil data order milik customer ini
    const [orders] = await db.query(`
      SELECT o.*, u.name AS customer_name, u.email AS customer_email,
             e.title AS event_title
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN events e ON o.event_id = e.id
      WHERE o.id = ? AND o.user_id = ?
    `, [order_id, req.user.id]);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    const order = orders[0];

    if (order.payment_status !== 'pending') {
      return res.status(400).json({
        message: 'Order ini tidak bisa dibayar',
        status: order.payment_status
      });
    }

    // Kalau sudah ada snap_token, langsung kembalikan
    if (order.snap_token) {
      return res.json({
        snap_token: order.snap_token,
        payment_url: order.payment_url
      });
    }

    // Ambil items order
    const [items] = await db.query(`
      SELECT oi.quantity, oi.price, oi.subtotal, tc.name AS category_name
      FROM order_items oi
      JOIN ticket_categories tc ON oi.ticket_category_id = tc.id
      WHERE oi.order_id = ?
    `, [order_id]);

    // Buat parameter Midtrans
    const parameter = {
      transaction_details: {
        order_id: `ORDER-${order.id}-${Date.now()}`,
        gross_amount: parseInt(order.total_price)
      },
      item_details: items.map(item => ({
        id: `ticket-${item.category_name}`,
        price: parseInt(item.price),
        quantity: item.quantity,
        name: `${order.event_title} - ${item.category_name}`
      })),
      customer_details: {
        first_name: order.customer_name,
        email: order.customer_email
      },
      callbacks: {
        finish: `${process.env.MOBILE_URL}/payment-success?order_id=${order.id}`,
        error: `${process.env.MOBILE_URL}/payment-error?order_id=${order.id}`,
        pending: `${process.env.MOBILE_URL}/payment-pending?order_id=${order.id}`
      }
    };

    // Request ke Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Simpan snap_token ke database
    await db.query(
      'UPDATE orders SET snap_token = ?, payment_url = ? WHERE id = ?',
      [transaction.token, transaction.redirect_url, order.id]
    );

    res.json({
      snap_token: transaction.token,
      payment_url: transaction.redirect_url
    });
  } catch (err) {
    console.error('Payment error detail:', err.message);
    console.error('Midtrans response:', err.ApiResponse || err);
    res.status(500).json({ message: 'Server error', error: err.message, detail: err.ApiResponse || null });
  }
};

// GET /api/customer/payments/:orderId  — cek status payment
export const getPaymentStatus = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.payment_method, p.transaction_id, p.transaction_status,
             p.status, p.verified_at, o.payment_status AS order_status
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      WHERE p.order_id = ? AND o.user_id = ?
    `, [req.params.orderId, req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data pembayaran tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
