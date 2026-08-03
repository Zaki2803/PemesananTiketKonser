import db from '../../config/db.js';

// GET /api/admin/dashboard
export const getDashboard = async (req, res) => {
  try {
    // Total orders per status
    const [orderStats] = await db.query(`
      SELECT payment_status, COUNT(*) AS total
      FROM orders
      GROUP BY payment_status
    `);

    // Total revenue (hanya dari order paid)
    const [revenue] = await db.query(`
      SELECT COALESCE(SUM(total_price), 0) AS total_revenue
      FROM orders
      WHERE payment_status = 'paid'
    `);

    // Total tiket terjual per event (berdasarkan order paid)
    const [ticketsSold] = await db.query(`
      SELECT e.id AS event_id, e.title, e.event_date,
             SUM(oi.quantity) AS total_tiket_terjual,
             SUM(oi.subtotal) AS total_pendapatan
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN events e ON o.event_id = e.id
      WHERE o.payment_status = 'paid'
      GROUP BY e.id, e.title, e.event_date
      ORDER BY e.event_date DESC
    `);

    // Kuota tiket per kategori per event
    const [quotaStats] = await db.query(`
      SELECT tc.id, tc.name AS kategori, tc.quota, tc.remaining_quota,
             (tc.quota - tc.remaining_quota) AS terjual,
             e.title AS event_title
      FROM ticket_categories tc
      JOIN events e ON tc.event_id = e.id
      ORDER BY e.event_date DESC
    `);

    // Total customer terdaftar
    const [customerCount] = await db.query(`
      SELECT COUNT(*) AS total_customer FROM users WHERE role = 'customer'
    `);

    // Total event aktif
    const [eventCount] = await db.query(`
      SELECT 
        COUNT(*) AS total_event,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS event_open,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS event_closed
      FROM events
    `);

    // Pending payments yang belum diverifikasi
    const [pendingPayments] = await db.query(`
      SELECT COUNT(*) AS total_pending FROM payments WHERE status = 'pending'
    `);

    res.json({
      summary: {
        total_revenue: revenue[0].total_revenue,
        total_customer: customerCount[0].total_customer,
        total_event: eventCount[0].total_event,
        event_open: eventCount[0].event_open,
        event_closed: eventCount[0].event_closed,
        pending_payments: pendingPayments[0].total_pending
      },
      order_stats: orderStats,
      tickets_sold_per_event: ticketsSold,
      quota_per_category: quotaStats
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
