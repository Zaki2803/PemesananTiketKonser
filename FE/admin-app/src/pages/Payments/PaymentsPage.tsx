import { useEffect, useState } from 'react';
import { paymentService } from '../../api/services';
import dayjs from 'dayjs';

interface Payment {
  id: number; order_id: number; user_name?: string; event_title?: string;
  total_price: number; payment_method?: string; status: string; created_at: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = () => {
    paymentService.getAll()
      .then((d) => setPayments(d?.data || d?.payments || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  const handle = async (action: 'verify' | 'reject', id: number) => {
    try {
      if (action === 'verify') await paymentService.verify(id);
      else await paymentService.reject(id);
      fetchPayments();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal memproses');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>Payments</h1>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0' }}>Verifikasi pembayaran customer</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, color: '#9CA3AF', textAlign: 'center' }}>Memuat data...</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
            <p>Belum ada pembayaran</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Order ID', 'Customer', 'Event', 'Total', 'Metode', 'Status', 'Tanggal', 'Aksi'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#4F46E5' }}>#{p.order_id}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#111827' }}>{p.user_name || '-'}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{p.event_title || '-'}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#111827' }}>
                    Rp{Number(p.total_price).toLocaleString('id-ID')}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{p.payment_method || '-'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: p.status === 'paid' ? '#DCFCE7' : p.status === 'pending' ? '#FEF9C3' : '#FEE2E2',
                      color: p.status === 'paid' ? '#16A34A' : p.status === 'pending' ? '#92400E' : '#DC2626',
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>
                    {dayjs(p.created_at).format('DD MMM YYYY')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {p.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handle('verify', p.id)} style={{
                          background: '#DCFCE7', color: '#16A34A', border: 'none',
                          borderRadius: 7, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}>Verify</button>
                        <button onClick={() => handle('reject', p.id)} style={{
                          background: '#FEE2E2', color: '#DC2626', border: 'none',
                          borderRadius: 7, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
