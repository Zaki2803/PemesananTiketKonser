import { useEffect, useState } from 'react';
import { ticketCategoryService, eventService } from '../../api/services';

interface Category { id: number; name: string; price: number; quota: number; event_id: number; }
interface Event { id: number; title: string; }

export default function TicketCategoriesPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    eventService.getAll()
      .then((d) => setEvents(d?.data || d?.events || d || []))
      .catch(() => {});
  }, []);

  const fetchCategories = (eventId: number) => {
    setLoading(true);
    ticketCategoryService.getByEvent(eventId)
      .then((d) => setCategories(d?.data || d?.categories || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setSelectedEventId(id || '');
    if (id) fetchCategories(id);
    else setCategories([]);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus kategori ini?')) return;
    try {
      await ticketCategoryService.delete(id);
      if (selectedEventId) fetchCategories(selectedEventId as number);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal menghapus');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>Ticket Categories</h1>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0' }}>Kelola kategori tiket per event</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <select value={selectedEventId} onChange={handleEventChange} style={{
          padding: '10px 14px', borderRadius: 10, border: '1px solid #E5E7EB',
          fontSize: 14, color: '#111827', background: '#fff', minWidth: 280,
        }}>
          <option value="">-- Pilih Event --</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {!selectedEventId ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎟️</div>
            <p>Pilih event untuk melihat kategori tiket</p>
          </div>
        ) : loading ? (
          <div style={{ padding: 32, color: '#9CA3AF', textAlign: 'center' }}>Memuat data...</div>
        ) : categories.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
            <p>Tidak ada kategori untuk event ini</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Nama Kategori', 'Harga', 'Kuota', 'Aksi'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>{c.name}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#111827' }}>
                    Rp{Number(c.price).toLocaleString('id-ID')}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{c.quota}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <button onClick={() => handleDelete(c.id)} style={{
                      background: '#FEE2E2', color: '#DC2626', border: 'none',
                      borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
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
