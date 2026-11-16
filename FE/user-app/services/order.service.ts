import api from './api';

export interface OrderItem {
  id: number;
  ticket_category_id: number;
  category_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  event_id: number;
  event_title: string;
  event_date: string;
  event_time?: string;
  venue: string;
  artist_name: string;
  poster?: string;
  total_price: number;
  payment_status: 'pending' | 'paid' | 'rejected' | 'cancelled' | 'failed' | 'expired';
  payment_proof?: string;
  payment_deadline?: string;
  seats?: { event_seat_id: number; seat_label: string; section_name: string; row_label: string; seat_number: number; price: number }[];
  payment?: { id: number; payment_method?: string; payment_proof?: string; status: string; verified_at?: string };
  order_date: string;
  items?: OrderItem[];
}

export interface CreateOrderPayload {
  event_id: number;
  items: { ticket_category_id: number; quantity: number }[];
  seat_ids?: number[];
}

export const orderService = {
  getMyOrders: async () => {
    const response = await api.get('/customer/orders');
    return response.data;
  },

  getOrderById: async (id: number) => {
    const response = await api.get(`/customer/orders/${id}`);
    return response.data;
  },

  createOrder: async (payload: CreateOrderPayload) => {
    const response = await api.post('/customer/orders', payload);
    return response.data;
  },

  cancelOrder: async (id: number) => {
    const response = await api.patch(`/customer/orders/${id}/cancel`);
    return response.data;
  },

  getOrderQRCode: async (id: number) => {
    const response = await api.get(`/customer/orders/${id}/qrcode`);
    return response.data;
  },
};
