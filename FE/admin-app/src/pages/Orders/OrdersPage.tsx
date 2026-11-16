import { useEffect, useState } from 'react';
import { orderService } from '../../api/services';
import dayjs from 'dayjs';

interface Order {
  id: number; event_title?: string; user_name?: string;
  total_price: number; payment_status: string; order_date: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#FEF9C3', color: '#92400E' },
  paid:      { bg: '#DCFCE7', color: '#16A34A' },
  rejected:  { bg: '#FEE2E2', color: '#DC2626' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280' },
  failed:    { bg: '#FEE2E2', color: '#DC2626' },
  expired:   { bg: '#F3F4F6', color: '#9CA3AF' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getAll()
      .then((d) => setOrders(d?.data || d?.orders || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>Orders</h1>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0' }}>Daftar seluruh pesanan customer</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, color: '#9CA3AF', textAlign: 'center' }}>Memuat data...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <p>Belum ada pesanan</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['ID', 'Event', 'Customer', 'Total', 'Status', 'Tanggal'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const s = STATUS_STYLE[o.payment_status] || { bg: '#F3F4F6', color: '#6B7280' };
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#4F46E5' }}>#{o.id}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#111827' }}>{o.event_title || '-'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{o.user_name || '-'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#111827' }}>
                      Rp{Number(o.total_price).toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
                        {o.payment_status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>
                      {dayjs(o.order_date).format('DD MMM YYYY')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
