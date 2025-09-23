import api from './api';

export const userAPI = {
  // Get current user's profile
  getMe: async () => {
    const response = await api.get('/user/me');
    return response.data;
  },

  // Update user's profile (including avatar)
  updateMe: async (userData) => {
    const response = await api.put('/user/update-me', userData);
    return response.data;
  },

  // Delete user's account
  deleteMe: async (password) => {
    const response = await api.post('/user/delete-me', { password });
    return response.data;
  },

  // Change user's password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    const response = await api.put('/user/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};