import apiClient from './client';

export const getUserSettingsApi = async () => {
  return apiClient.get('/settings');
};

export const updateUserSettingsApi = async (settings) => {
  return apiClient.put('/settings', settings);
};

export const updatePasswordApi = async (passwordData) => {
  return apiClient.put('/settings/password', passwordData);
};

export const deleteAccountApi = async () => {
  return apiClient.delete('/settings/account');
};

export const settingsApi = {
  getUserSettings: getUserSettingsApi,
  updateUserSettings: updateUserSettingsApi,
  updatePassword: updatePasswordApi,
  deleteAccount: deleteAccountApi
};

export default settingsApi;

