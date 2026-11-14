import db from '../config/db.js';
import { coreApi } from '../config/midtrans.js';
import crypto from 'crypto';

// POST /api/payments/webhook  — Midtrans notification handler
export const handleWebhook = async (req, res) => {
  const notification = req.body;

  try {
    // Verifikasi signature Midtrans
    const signatureKey = crypto
      .createHash('sha512')
      .update(
        notification.order_id +
        notification.status_code +
        notification.gross_amount +
        process.env.MIDTRANS_SERVER_KEY
      )
      .digest('hex');

    if (signatureKey !== notification.signature_key) {
      return res.status(403).json({ message: 'Invalid signature' });
    }

    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const midtransOrderId = notification.order_id; // FORMAT: ORDER-{id}-{timestamp}

    // Ambil order id asli dari order_id Midtrans
    const orderId = midtransOrderId.split('-')[1];

    // Tentukan status order berdasarkan status Midtrans
    let orderStatus = 'pending';
    let paymentStatus = 'pending';

    if (transactionStatus === 'capture') {
      orderStatus = fraudStatus === 'accept' ? 'paid' : 'pending';
      paymentStatus = fraudStatus === 'accept' ? 'verified' : 'pending';
    } else if (transactionStatus === 'settlement') {
      orderStatus = 'paid';
      paymentStatus = 'verified';
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      orderStatus = transactionStatus === 'expire' ? 'expired' : 'cancelled';
      paymentStatus = 'rejected';
    } else if (transactionStatus === 'pending') {
      orderStatus = 'pending';
      paymentStatus = 'pending';
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Update status order
      const [orderRows] = await conn.query('SELECT payment_status, quota_released_at FROM orders WHERE id = ? FOR UPDATE', [orderId]);
      if (!orderRows.length) {
        await conn.rollback();
        return res.status(404).json({ message: 'Order tidak ditemukan' });
      }
      const previousStatus = orderRows[0].payment_status;
      const terminal = ['paid', 'cancelled', 'expired'];
      if (previousStatus === 'paid' && orderStatus !== 'paid') orderStatus = 'paid';
      await conn.query(
        'UPDATE orders SET payment_status = ? WHERE id = ?',
        [orderStatus, orderId]
      );

      // Cek apakah sudah ada record di payments
      const [existing] = await conn.query(
        'SELECT id FROM payments WHERE order_id = ?',
        [orderId]
      );

      if (existing.length > 0) {
        // Update payment yang sudah ada
        await conn.query(
          `UPDATE payments SET 
           payment_method = ?, transaction_id = ?, transaction_status = ?,
           status = ?, verified_at = ?
           WHERE order_id = ?`,
          [
            notification.payment_type,
            notification.transaction_id,
            transactionStatus,
            paymentStatus,
            paymentStatus === 'verified' ? new Date() : null,
            orderId
          ]
        );
      } else {
        // Insert payment baru
        await conn.query(
          `INSERT INTO payments (order_id, payment_method, transaction_id, transaction_status, status, verified_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            notification.payment_type,
            notification.transaction_id,
            transactionStatus,
            paymentStatus,
            paymentStatus === 'verified' ? new Date() : null
          ]
        );
      }

      // Jika cancelled/expired, kembalikan quota
      if (['cancelled', 'expired'].includes(orderStatus) && previousStatus === 'pending' && !orderRows[0].quota_released_at) {
        const [items] = await conn.query(
          'SELECT * FROM order_items WHERE order_id = ?',
          [orderId]
        );
        const [seatRows] = await conn.query('SELECT id FROM order_seats WHERE order_id = ? LIMIT 1', [orderId]);
        if (seatRows.length === 0) {
          for (const item of items) {
            await conn.query(
              'UPDATE ticket_categories SET remaining_quota = LEAST(quota, remaining_quota + ?) WHERE id = ?',
              [item.quantity, item.ticket_category_id]
            );
          }
        }
        await conn.query("UPDATE event_seats es JOIN order_seats os ON os.event_seat_id = es.id SET es.status = 'available', es.held_until = NULL WHERE os.order_id = ? AND es.status = 'held'", [orderId]);
        await conn.query('UPDATE orders SET quota_released_at = NOW() WHERE id = ?', [orderId]);
      }

      if (orderStatus === 'paid') {
        await conn.query("UPDATE event_seats es JOIN order_seats os ON os.event_seat_id = es.id SET es.status = 'sold', es.held_until = NULL WHERE os.order_id = ?", [orderId]);
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    res.json({ message: 'Webhook processed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
