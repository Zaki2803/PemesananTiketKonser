import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const NAV = [
  { to: '/',             label: 'Dashboard',         icon: '📊' },
  { to: '/events',       label: 'Events',             icon: '🎵' },
  { to: '/artists',      label: 'Artists',            icon: '🎤' },
  { to: '/categories',   label: 'Ticket Categories',  icon: '🎟️' },
  { to: '/orders',       label: 'Orders',             icon: '📦' },
  { to: '/payments',     label: 'Payments',           icon: '💳' },
];

export default function Sidebar() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: 240, background: '#111827', color: '#fff',
      display: 'flex', flexDirection: 'column', padding: '24px 0',
      minHeight: '100vh', flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: '0 24px 28px', borderBottom: '1px solid #1f2937' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#F5C518', letterSpacing: 0.5 }}>
          🎸 Crescendo
        </div>
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Admin Dashboard</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
            fontSize: 14, fontWeight: isActive ? 700 : 400,
            background: isActive ? '#F5C518' : 'transparent',
            color: isActive ? '#111827' : '#D1D5DB',
            transition: 'all 0.15s',
          })}>
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #1f2937' }}>
        <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 4 }}>{user?.name}</div>
        <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 12 }}>{user?.email}</div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '8px', borderRadius: 8, border: 'none',
          background: '#1f2937', color: '#F87171', cursor: 'pointer', fontSize: 13, fontWeight: 600,
        }}>
          Logout
        </button>
      </div>
    </aside>
  );
}
