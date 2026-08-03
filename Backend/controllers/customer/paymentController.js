import db from '../../config/db.js';
import fs from 'fs';

// POST /api/customer/payments  — upload bukti pembayaran
export const submitPayment = async (req, res) => {
  const { order_id, payment_method } = req.body;
  const payment_proof = req.file ? req.file.path.replace(/\\/g, '/') : null;

  const validMethods = ['Transfer Bank', 'E-Wallet', 'QRIS'];
  if (!order_id || !payment_method || !payment_proof) {
    return res.status(400).json({ message: 'order_id, payment_method, dan bukti pembayaran wajib diisi' });
  }

  if (!validMethods.includes(payment_method)) {
    return res.status(400).json({ message: 'Metode pembayaran tidak valid' });
  }

  try {
    // Pastikan order milik customer ini dan masih pending
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [order_id, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    if (orders[0].payment_status !== 'pending') {
      return res.status(400).json({ message: 'Order ini tidak bisa dibayar (status bukan pending)' });
    }

    // Cek apakah sudah ada payment untuk order ini
    const [existing] = await db.query(
      'SELECT id FROM payments WHERE order_id = ?',
      [order_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Bukti pembayaran sudah pernah dikirim untuk order ini' });
    }

    await db.query(
      'INSERT INTO payments (order_id, payment_method, payment_proof, status) VALUES (?, ?, ?, ?)',
      [order_id, payment_method, payment_proof, 'pending']
    );

    // Update payment_proof di tabel orders juga
    await db.query(
      'UPDATE orders SET payment_proof = ? WHERE id = ?',
      [payment_proof, order_id]
    );

    res.status(201).json({ message: 'Bukti pembayaran berhasil dikirim, menunggu verifikasi admin' });
  } catch (err) {
    // Hapus file jika query gagal
    if (payment_proof && fs.existsSync(payment_proof)) fs.unlinkSync(payment_proof);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/customer/payments/:orderId  — cek status payment berdasarkan order
export const getPaymentStatus = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.payment_method, p.payment_proof, p.status, p.verified_at
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
