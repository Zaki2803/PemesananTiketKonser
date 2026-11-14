import db from '../config/db.js';

export const getEventSeats = async (req, res) => {
  try {
    let [rows] = await db.query(`
      SELECT es.id, es.event_id, es.ticket_category_id, es.section_name,
             es.row_label, es.seat_number, es.seat_label, es.price, es.status,
             CASE WHEN es.status = 'held' AND es.held_until < NOW() THEN 'available' ELSE es.status END AS display_status,
             tc.name AS category_name
      FROM event_seats es
      JOIN ticket_categories tc ON es.ticket_category_id = tc.id
      WHERE es.event_id = ?
      ORDER BY es.ticket_category_id ASC, es.section_name, es.row_label, es.seat_number
    `, [req.params.eventId]);

    // Jika belum ada kursi yang digenerate untuk event ini, generate otomatis denah kursi per kategori
    if (rows.length === 0) {
      const [categories] = await db.query(
        'SELECT id, name, price FROM ticket_categories WHERE event_id = ? ORDER BY price DESC',
        [req.params.eventId]
      );

      if (categories.length > 0) {
        const conn = await db.getConnection();
        try {
          await conn.beginTransaction();
          for (const cat of categories) {
            // Buat baris A dan B masing-masing 8 kursi untuk setiap kategori
            const rowsList = ['A', 'B'];
            for (const rLabel of rowsList) {
              for (let sNum = 1; sNum <= 8; sNum++) {
                const sLabel = `${cat.name.replace(/\s+/g, '')}-${rLabel}${sNum}`;
                await conn.query(
                  `INSERT INTO event_seats (event_id, ticket_category_id, section_name, row_label, seat_number, seat_label, price, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?, 'available')
                   ON DUPLICATE KEY UPDATE id=id`,
                  [req.params.eventId, cat.id, cat.name, rLabel, sNum, sLabel, cat.price]
                );
              }
            }
          }
          await conn.commit();
        } catch (genErr) {
          await conn.rollback();
          console.error('Auto-generate seats error:', genErr);
        } finally {
          conn.release();
        }

        // Ambil kembali data kursi setelah dibuat
        const [newRows] = await db.query(`
          SELECT es.id, es.event_id, es.ticket_category_id, es.section_name,
                 es.row_label, es.seat_number, es.seat_label, es.price, es.status,
                 CASE WHEN es.status = 'held' AND es.held_until < NOW() THEN 'available' ELSE es.status END AS display_status,
                 tc.name AS category_name
          FROM event_seats es
          JOIN ticket_categories tc ON es.ticket_category_id = tc.id
          WHERE es.event_id = ?
          ORDER BY es.ticket_category_id ASC, es.section_name, es.row_label, es.seat_number
        `, [req.params.eventId]);
        rows = newRows;
      }
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data kursi', error: err.message });
  }
};

export const generateSeats = async (req, res) => {
  const { ticket_category_id, section_name, row_label, start_number, end_number } = req.body;
  const start = Number(start_number); const end = Number(end_number);
  if (!ticket_category_id || !section_name || !row_label || !Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end - start > 500) {
    return res.status(400).json({ message: 'Data kursi tidak valid (maksimal 500 kursi per baris)' });
  }
  const conn = await db.getConnection();
  try {
    const [category] = await conn.query('SELECT id, event_id, price FROM ticket_categories WHERE id = ?', [ticket_category_id]);
    if (!category.length || Number(category[0].event_id) !== Number(req.params.eventId)) return res.status(404).json({ message: 'Kategori tidak ditemukan pada event ini' });
    await conn.beginTransaction();
    for (let n = start; n <= end; n++) {
      await conn.query(`INSERT INTO event_seats (event_id, ticket_category_id, section_name, row_label, seat_number, seat_label, price) VALUES (?, ?, ?, ?, ?, ?, ?)`, [req.params.eventId, ticket_category_id, section_name, row_label, n, `${section_name}-${row_label}${n}`, category[0].price]);
    }
    await conn.commit();
    res.status(201).json({ message: 'Kursi berhasil dibuat', total: end - start + 1 });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Sebagian kursi sudah ada' });
    res.status(500).json({ message: 'Gagal membuat kursi' });
  } finally { conn.release(); }
};

export const updateSeatStatus = async (req, res) => {
  const { status } = req.body;
  if (!['available', 'blocked'].includes(status)) return res.status(400).json({ message: 'Status kursi tidak valid' });
  const [result] = await db.query("UPDATE event_seats SET status = ?, held_until = NULL WHERE id = ? AND status IN ('available','blocked')", [status, req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Kursi tidak ditemukan atau sudah terjual' });
  res.json({ message: 'Status kursi diperbarui' });
};
