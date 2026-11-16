import { useEffect, useState } from 'react';
import { eventService, artistService } from '../../api/services';
import dayjs from 'dayjs';

interface Event {
  id: number; title: string; artist_name?: string;
  event_date: string; venue: string; status: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = () => {
    eventService.getAll()
      .then((d) => setEvents(d?.data || d?.events || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Hapus event "${title}"?`)) return;
    try {
      await eventService.delete(id);
      fetchEvents();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal menghapus event');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>Events</h1>
          <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0' }}>Kelola semua event konser</p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, color: '#9CA3AF', textAlign: 'center' }}>Memuat data...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
            <p>Belum ada event</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Title', 'Artist', 'Tanggal', 'Venue', 'Status', 'Aksi'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>{ev.title}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{ev.artist_name || '-'}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{dayjs(ev.event_date).format('DD MMM YYYY')}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{ev.venue}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: ev.status === 'open' ? '#DCFCE7' : ev.status === 'closed' ? '#FEE2E2' : '#FEF9C3',
                      color: ev.status === 'open' ? '#16A34A' : ev.status === 'closed' ? '#DC2626' : '#92400E',
                    }}>
                      {ev.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button onClick={() => handleDelete(ev.id, ev.title)} style={{
                      background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 7,
                      padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      Hapus
                    </button>
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
