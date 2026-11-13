// API calls for in-app notifications.
import api from './api';
import { ApiResponse, AppNotification } from '../types';

const notificationService = {
  getNotifications: async (page = 1, limit = 10) => {
    const res = await api.get<ApiResponse<{ notifications: AppNotification[]; unreadCount: number }>>('/notifications', {
      params: { page, limit },
    });
    return { ...res.data.data, pagination: res.data.pagination! };
  },
  getUnreadCount: async () =>
    (await api.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count')).data.data.unreadCount,
  markAsRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    await api.patch('/notifications/read-all');
  },
};

export default notificationService;