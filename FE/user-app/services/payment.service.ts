import api from './api';

export const paymentService = {
  createPayment: async (order_id: number) => {
    const response = await api.post('/customer/payments/create', { order_id });
    return response.data;
  },

  getPaymentStatus: async (order_id: number) => {
    const response = await api.get(`/customer/payments/${order_id}`);
    return response.data;
  },
};
