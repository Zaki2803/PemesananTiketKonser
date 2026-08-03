import QRCode from 'qrcode';
import db from '../../config/db.js';

// GET /api/customer/orders/:id/qrcode
export const getOrderQRCode = async (req, res) => {
  try {
    // Cek order milik customer ini dan sudah paid
    const [rows] = await db.query(`
      SELECT o.id, o.total_price, o.payment_status, o.order_date,
             e.title AS event_title, e.event_date, e.event_time, e.venue, e.city,
             u.name AS customer_name
      FROM orders o
      JOIN events e ON o.event_id = e.id
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ? AND o.user_id = ?
    `, [req.params.id, req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    const order = rows[0];

    if (order.payment_status !== 'paid') {
      return res.status(400).json({
        message: 'QR Code hanya tersedia untuk order yang sudah dibayar',
        payment_status: order.payment_status
      });
    }

    // Ambil item tiket
    const [items] = await db.query(`
      SELECT oi.quantity, tc.name AS kategori, oi.subtotal
      FROM order_items oi
      JOIN ticket_categories tc ON oi.ticket_category_id = tc.id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    // Data yang di-encode ke QR
    const qrData = JSON.stringify({
      order_id: order.id,
      customer: order.customer_name,
      event: order.event_title,
      event_date: order.event_date,
      event_time: order.event_time,
      venue: order.venue,
      city: order.city,
      tiket: items.map(i => `${i.kategori} x${i.quantity}`).join(', '),
      total: order.total_price,
      status: order.payment_status
    });

    // Generate QR sebagai base64 image
    const qrImage = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2
    });

    res.json({
      order_id: order.id,
      event_title: order.event_title,
      event_date: order.event_date,
      event_time: order.event_time,
      venue: order.venue,
      city: order.city,
      customer_name: order.customer_name,
      items,
      total_price: order.total_price,
      qr_code: qrImage // base64 PNG, langsung bisa ditampilkan di <img src="...">
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
