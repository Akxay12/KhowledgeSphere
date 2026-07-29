import apiClient from './client';

export const getNotificationsApi = async () => {
  return apiClient.get('/notifications');
};

export const markNotificationReadApi = async (id) => {
  return apiClient.put(`/notifications/${id}/read`);
};

export const markAllNotificationsReadApi = async () => {
  return apiClient.put('/notifications/read-all');
};
