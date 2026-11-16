import { useEffect, useState } from 'react';
import { artistService } from '../../api/services';

interface Artist { id: number; name: string; genre?: string; bio?: string; }

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArtists = () => {
    artistService.getAll()
      .then((d) => setArtists(d?.data || d?.artists || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchArtists(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Hapus artist "${name}"?`)) return;
    try {
      await artistService.delete(id);
      fetchArtists();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal menghapus artist');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>Artists</h1>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '4px 0 0' }}>Kelola data artis konser</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 32, color: '#9CA3AF', textAlign: 'center' }}>Memuat data...</div>
        ) : artists.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎤</div>
            <p>Belum ada artist</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Nama', 'Genre', 'Bio', 'Aksi'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {artists.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>{a.name}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{a.genre || '-'}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280', maxWidth: 240 }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {a.bio || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button onClick={() => handleDelete(a.id, a.name)} style={{
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
