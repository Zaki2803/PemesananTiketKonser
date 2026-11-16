import { useEffect, useState } from 'react';
import { dashboardService } from '../../api/services';

interface Summary {
  total_events?: number;
  total_orders?: number;
  total_revenue?: number;
  total_customers?: number;
  pending_payments?: number;
}

const StatCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) => (
  <div style={{
    background: '#fff', borderRadius: 14, padding: '22px 24px',
    border: '1px solid #E5E7EB', flex: 1, minWidth: 160,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  }}>
    <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{label}</div>
  </div>
);

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getSummary()
      .then((d) => setSummary(d?.data || d || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6 }}>Dashboard</h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>Ringkasan data aplikasi Crescendo</p>

      {loading ? (
        <p style={{ color: '#9CA3AF' }}>Memuat data...</p>
      ) : (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StatCard label="Total Events"    value={summary.total_events    ?? 0} icon="🎵" color="#4F46E5" />
          <StatCard label="Total Orders"    value={summary.total_orders    ?? 0} icon="📦" color="#0891B2" />
          <StatCard label="Total Revenue"   value={`Rp${Number(summary.total_revenue ?? 0).toLocaleString('id-ID')}`} icon="💰" color="#16A34A" />
          <StatCard label="Total Customers" value={summary.total_customers ?? 0} icon="👥" color="#D97706" />
          <StatCard label="Pending Payment" value={summary.pending_payments ?? 0} icon="⏳" color="#DC2626" />
        </div>
      )}
    </div>
  );
}
