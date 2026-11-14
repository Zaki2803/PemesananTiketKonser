import api from './api';

export interface Artist {
  id: number;
  name: string;
  genre?: string;
  image?: string;
}

export interface TicketCategory {
  id: number;
  name: string;
  price: number;
  quota: number;
  available: number;
  remaining_quota?: number;
  benefits?: string;  // pipe-separated: "benefit1|benefit2|benefit3"
}

export interface EventSeat {
  id: number;
  event_id: number;
  ticket_category_id: number;
  section_name: string;
  row_label: string;
  seat_number: number;
  seat_label: string;
  price: number;
  status: 'available' | 'held' | 'sold' | 'blocked';
  display_status?: 'available' | 'held' | 'sold' | 'blocked';
  category_name?: string;
}

export interface Event {
  id: number;
  title: string;
  event_date: string;
  event_time?: string;
  venue: string;
  city?: string;
  genre?: string;
  description?: string;
  poster?: string;
  status: string;
  artist_id?: number;
  artist_name?: string;
  artist_photo?: string;
  ticket_categories?: TicketCategory[];
  min_price?: number;       // dari subquery backend
  max_price?: number;       // dari subquery backend
  minPrice?: number;        // fallback computed
}

export const eventService = {
  // Daftar semua event
  getEvents: async (params?: { category?: string; search?: string }) => {
    const response = await api.get('/customer/events', { params });
    return response.data;
  },

  getSeats: async (eventId: number) => {
    const response = await api.get(`/events/${eventId}/seats`);
    return response.data;
  },

  // Detail event
  getEventById: async (id: number) => {
    const response = await api.get(`/customer/events/${id}`);
    return response.data;
  },
};
