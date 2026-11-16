import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import EventsPage from './pages/Events/EventsPage';
import ArtistsPage from './pages/Artists/ArtistsPage';
import TicketCategoriesPage from './pages/TicketCategories/TicketCategoriesPage';
import OrdersPage from './pages/Orders/OrdersPage';
import PaymentsPage from './pages/Payments/PaymentsPage';

export default function App() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="artists" element={<ArtistsPage />} />
          <Route path="categories" element={<TicketCategoriesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="payments" element={<PaymentsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
