USE konser_ticket;

-- Jalankan setelah schema utama. Mendukung pemilihan kursi individual.
ALTER TABLE events
  ADD COLUMN payment_deadline_minutes INT NOT NULL DEFAULT 30,
  ADD COLUMN cancelled_at DATETIME NULL;

ALTER TABLE orders
  ADD COLUMN payment_deadline DATETIME NULL,
  ADD COLUMN quota_released_at DATETIME NULL,
  ADD COLUMN ticket_token CHAR(36) NULL,
  ADD COLUMN redeemed_at DATETIME NULL;

UPDATE orders
SET payment_deadline = DATE_ADD(order_date, INTERVAL 30 MINUTE)
WHERE payment_deadline IS NULL;

ALTER TABLE orders ADD UNIQUE KEY uq_orders_ticket_token (ticket_token);

CREATE TABLE event_seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  ticket_category_id INT NOT NULL,
  section_name VARCHAR(50) NOT NULL,
  row_label VARCHAR(20) NOT NULL,
  seat_number INT NOT NULL,
  seat_label VARCHAR(80) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  status ENUM('available','held','sold','blocked') NOT NULL DEFAULT 'available',
  held_until DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_seat_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_seat_category FOREIGN KEY (ticket_category_id) REFERENCES ticket_categories(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_event_seat_label (event_id, seat_label),
  INDEX idx_seat_event_status (event_id, status)
);

CREATE TABLE order_seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  event_seat_id INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  redeemed_at DATETIME NULL,
  CONSTRAINT fk_order_seat_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_seat_seat FOREIGN KEY (event_seat_id) REFERENCES event_seats(id),
  UNIQUE KEY uq_order_event_seat (event_seat_id)
);

CREATE INDEX idx_orders_deadline ON orders(payment_status, payment_deadline);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);

-- Setelah menjalankan migration, isi token untuk data lama jika diperlukan:
-- UPDATE orders SET ticket_token = UUID() WHERE ticket_token IS NULL;
